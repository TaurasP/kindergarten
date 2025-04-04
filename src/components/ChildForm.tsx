import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO, isValid, isAfter } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import icon from "@/assets/icon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "@/components/ui/navbar";

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
  const authContext = useContext(AuthContext);

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

    const textRegex = /^[\p{L}\s'.,-]+$/u;

    if (!name || !textRegex.test(name)) {
      newErrors.name = "Name must contain only letters, spaces, and symbols.";
    }

    if (!surname || !textRegex.test(surname)) {
      newErrors.surname =
        "Surname must contain only letters, spaces, and symbols.";
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

  const handleLogout = () => {
    authContext?.logout();
    navigate("/login");
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4">
          <header className="sticky top-0 z-50 -mb-4 px-4 pb-4">
            <div className="fade-bottom absolute left-0 h-24 w-full backdrop-blur-lg"></div>
            <div className="relative mx-auto max-w-container">
              <NavbarComponent>
                <NavbarLeft>
                  <a
                    className="flex items-center gap-2 text-xl font-bold cursor-pointer"
                    onClick={() => navigate("/groups")}
                  >
                    <img src={icon} className="h-10 w-10" />{" "}
                  </a>
                  <a
                    className="ml-5"
                    href={authContext?.isAuthenticated ? "/groups" : "/login"}
                  >
                    Groups
                  </a>
                  <a
                    className="ml-5"
                    href={authContext?.isAuthenticated ? "/children" : "/login"}
                  >
                    Children
                  </a>
                </NavbarLeft>
                <NavbarRight>
                  <Button
                    variant="default"
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    Logout
                  </Button>
                </NavbarRight>
              </NavbarComponent>
              <div className="flex flex-col justify-between bg-gray-100">
                <div className="flex-grow">
                  <div className="mb-5">
                    <div className="flex items-center">
                      <form
                        onSubmit={handleSubmit}
                        className="mx-auto w-100 p-4 bg-white shadow-md rounded-md w-50"
                      >
                        <div className="mb-4">
                          <h1 className="text-3xl mb-5 text-center">
                            Child form
                          </h1>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.name}
                            </p>
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
                            <p className="text-red-500 text-sm mt-1">
                              {errors.surname}
                            </p>
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
                              if (
                                !allowedKeys.includes(e.key) &&
                                (e.key < "0" || e.key > "9")
                              ) {
                                e.preventDefault();
                              }
                            }}
                            className="mt-1"
                          />
                          {errors.dateOfBirth && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.dateOfBirth}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          variant="default"
                          className="w-full cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faFloppyDisk} />{" "}
                          {id ? "Update Child" : "Add Child"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>
    </>
  );
};

export default ChildForm;
