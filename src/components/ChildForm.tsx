import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO, isValid, isAfter } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";

const ChildForm: React.FC = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    surname?: string;
    dateOfBirth?: string;
  }>({});
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchChild = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/children/${id}`,
            {
              headers: { Authorization: localStorage.getItem("token") },
            }
          );
          const { name, surname, dateOfBirth } = response.data;
          setName(name);
          setSurname(surname);
          setDateOfBirth(
            dateOfBirth ? format(parseISO(dateOfBirth), "yyyy-MM-dd") : ""
          );
        } catch (error) {
          console.error("Error fetching child data:", error);
          alert("Failed to fetch child data. Please try again.");
        }
      };

      fetchChild();
    }
  }, [id]);

  const validateForm = () => {
    const newErrors: { name?: string; surname?: string; dateOfBirth?: string } =
      {};

    const textRegex = /^[a-zA-Z\s]+$/;

    if (!name || !textRegex.test(name)) {
      newErrors.name = "Name must contain only letters and spaces.";
    }

    if (!surname || !textRegex.test(surname)) {
      newErrors.surname = "Surname must contain only letters and spaces.";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
    } else {
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
      if (!dateRegex.test(dateOfBirth)) {
        newErrors.dateOfBirth =
          "Date of birth must be in the format yyyy-MM-dd (e.g., 2025-01-01).";
      } else {
        const parsedDate = parseISO(dateOfBirth);
        if (!isValid(parsedDate)) {
          newErrors.dateOfBirth =
            "Date of birth must be a valid date in the format yyyy-MM-dd.";
        } else if (isAfter(parsedDate, new Date())) {
          newErrors.dateOfBirth = "Date of birth cannot be in the future.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        name,
        surname,
        dateOfBirth,
      };

      if (id) {
        await axios.put(`http://localhost:8080/children/${id}`, payload, {
          headers: { Authorization: localStorage.getItem("token") },
        });
        alert("Child updated successfully!");
      } else {
        await axios.post("http://localhost:8080/children", payload, {
          headers: { Authorization: localStorage.getItem("token") },
        });
        alert("Child created successfully!");
      }

      navigate("/children");
    } catch (error) {
      console.error("Error saving child:", error);
      alert("Failed to save child. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md"
    >
      <div className="mb-4">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="surname">Surname</Label>
        <Input
          id="surname"
          type="text"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="mt-1"
        />
        {errors.surname && (
          <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
        )}
      </div>

      <div className="mb-4">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="text"
          placeholder="yyyy-MM-dd"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          onKeyDown={(e) => {
            const allowedKeys = [
              "Backspace",
              "ArrowLeft",
              "ArrowRight",
              "Tab",
              "-",
            ];
            if (!allowedKeys.includes(e.key) && (e.key < "0" || e.key > "9")) {
              e.preventDefault();
            }
          }}
          className="mt-1"
        />
        {errors.dateOfBirth && (
          <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
        )}
      </div>

      <Button type="submit" variant="default" className="w-full cursor-pointer">
        {id ? "Update Child" : "Create Child"}
      </Button>
    </form>
  );
};

export default ChildForm;
