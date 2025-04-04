import { Child } from "@/models/Child";
import { Group } from "@/models/Group";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const GroupForm: React.FC = () => {
  const [group, setGroup] = useState<Group>({
    id: 0,
    name: "",
    children: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Child[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Get the group ID from the route parameters

  useEffect(() => {
    // Check if group data is passed via location.state
    if (location.state?.group) {
      setGroup(location.state.group);
    } else if (id) {
      // Fetch group data by ID if not passed via location.state
      const fetchGroup = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/groups/${id}`,
            {
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            }
          );
          setGroup(response.data);
        } catch (error) {
          console.error("Error fetching group:", error);
        }
      };
      fetchGroup();
    }
  }, [id, location.state]);

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroup({ ...group, name: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const fetchChildren = async () => {
    try {
      const response = await axios.get("http://localhost:8080/children", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const childrenWithoutGroups = response.data.filter(
        (child: Child) => child.groupId === null
      );

      const sortedChildren = childrenWithoutGroups.sort(
        (a: { name: string }, b: { name: string }) =>
          a.name.localeCompare(b.name)
      );

      const filteredResults = searchQuery
        ? sortedChildren.filter((child: Child) =>
            `${child.name} ${child.surname}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        : sortedChildren;

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const addChildToGroup = (child: Child) => {
    if (!group.children.some((c) => c.id === child.id)) {
      const updatedChildren = [...group.children, child].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setGroup({ ...group, children: updatedChildren });
    }
  };

  const removeChildFromGroup = (childId: number) => {
    setGroup({
      ...group,
      children: group.children.filter((child) => child.id !== childId),
    });
  };

  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (group.id) {
        // Update existing group
        await axios.put(`http://localhost:8080/groups/${group.id}`, group, {
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        });
      } else {
        // Create new group
        await axios.post("http://localhost:8080/groups", group, {
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        });
      }
      navigate("/groups");
    } catch (error) {
      console.error("Error submitting group:", error);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [searchQuery]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Group Name
        </label>
        <input
          type="text"
          value={group.name}
          onChange={handleGroupNameChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Search Children</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for children..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <div className="mt-2">
          {searchResults.map((child) => (
            <div
              key={child.id}
              className={`p-2 border rounded-lg mb-2 ${
                group.children.some((c) => c.id === child.id)
                  ? "bg-blue-100"
                  : ""
              }`}
            >
              <p>
                {child.name} {child.surname} ({calculateAge(child.dateOfBirth)}{" "}
                {calculateAge(child.dateOfBirth) > 1 ? "years" : "year"})
              </p>
              <button
                type="button"
                onClick={() => addChildToGroup(child)}
                className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                disabled={group.children.some((c) => c.id === child.id)}
              >
                {group.children.some((c) => c.id === child.id)
                  ? "Added"
                  : "Select"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Children in Group</h3>
        {group.children.map((child) => (
          <div key={child.id} className="mb-4 p-4 border rounded-lg">
            <p>
              {child.name} {child.surname} ({calculateAge(child.dateOfBirth)}{" "}
              {calculateAge(child.dateOfBirth) > 1 ? "years" : "year"})
            </p>
            <button
              type="button"
              onClick={() => removeChildFromGroup(child.id)}
              className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
      >
        Submit Group
      </button>
    </div>
  );
};

export default GroupForm;
