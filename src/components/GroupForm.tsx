import { Child } from "@/models/Child";
import { Group } from "@/models/Group";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "@/components/ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "@/components/ui/navbar";
import icon from "@/assets/icon.png";

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
  const { id } = useParams();
  const authContext = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const childrenPerPage = 5;
  const childrenInGroupPerPage = 5;
  const [currentGroupPage, setCurrentGroupPage] = useState(1);

  const indexOfLastGroupChild = currentGroupPage * childrenInGroupPerPage;
  const indexOfFirstGroupChild = indexOfLastGroupChild - childrenInGroupPerPage;

  const currentGroupChildren = group.children.slice(
    indexOfFirstGroupChild,
    indexOfLastGroupChild
  );

  const nextGroupPage = () => {
    if (
      currentGroupPage <
      Math.ceil(group.children.length / childrenInGroupPerPage)
    ) {
      setCurrentGroupPage(currentGroupPage + 1);
    }
  };

  const prevGroupPage = () => {
    if (currentGroupPage > 1) {
      setCurrentGroupPage(currentGroupPage - 1);
    }
  };

  useEffect(() => {
    if (location.state?.group) {
      setGroup(location.state.group);
    } else if (id) {
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

  const [groupNameError, setGroupNameError] = useState<string | null>(null);

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z\s]*$/;

    if (!regex.test(value)) {
      setGroupNameError("Group name can only contain letters and spaces.");
    } else {
      setGroupNameError(null);
      setGroup({ ...group, name: value });
    }
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
        ? sortedChildren.filter((child: Child) => {
            const age = calculateAge(child.dateOfBirth).toString();
            const dateOfBirth = new Date(child.dateOfBirth)
              .toISOString()
              .split("T")[0];
            return (
              `${child.name} ${child.surname}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              dateOfBirth.includes(searchQuery) ||
              age.includes(searchQuery)
            );
          })
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

  const handleLogout = () => {
    authContext?.logout();
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (group.id) {
        await axios.put(`http://localhost:8080/groups/${group.id}`, group, {
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        });
      } else {
        await axios.post("http://localhost:8080/groups", group, {
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        });
      }
      navigate("/groups");
    } catch (error: any) {
      console.error("Error submitting group:", error);

      if (error.response) {
        console.error("Server responded with:", error.response.data);
        alert(
          `Failed to save the group. Server responded with: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert(
          "Failed to save the group. No response received from the server."
        );
      } else {
        console.error("Error setting up the request:", error.message);
        alert(
          "Failed to save the group. Please check your network connection."
        );
      }
    }
  };

  const indexOfLastChild = currentPage * childrenPerPage;
  const indexOfFirstChild = indexOfLastChild - childrenPerPage;

  const currentChildren = searchResults.slice(
    indexOfFirstChild,
    indexOfLastChild
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(searchResults.length / childrenPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [searchQuery]);

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
                  <a className="mr-2">Group name</a>
                  <input
                    type="text"
                    value={group.name}
                    onChange={handleGroupNameChange}
                    placeholder="Group name"
                    className={`border ${
                      groupNameError ? "border-red-500" : "border-gray-300"
                    } rounded-md px-4 py-2 mb-3 w-130`}
                    style={{ height: "37px" }}
                  />
                  {groupNameError && (
                    <p className="text-red-500 text-sm mt-1">
                      {groupNameError}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        className="cursor-pointer"
                      >
                        Save changes
                      </Button>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="&#128269;  Search child by name, surname, date of birth or age"
                        className="border border-gray-300 rounded-md px-4 py-2 ml-3 w-120"
                        style={{ height: "37px" }}
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-2">Search results</h3>
                  {searchResults.length > 0 ? (
                    <Table className="mb-2">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead className="w-[150px]">Name</TableHead>
                          <TableHead className="w-[150px]">Surname</TableHead>
                          <TableHead className="w-[150px]">
                            Date of birth
                          </TableHead>
                          <TableHead className="w-[100px]">Age</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentChildren.map((child, index) => (
                          <TableRow key={child.id}>
                            <TableCell>
                              {indexOfFirstChild + index + 1}
                            </TableCell>
                            <TableCell>{child.name}</TableCell>
                            <TableCell>{child.surname}</TableCell>
                            <TableCell>
                              {
                                new Date(child.dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </TableCell>
                            <TableCell>
                              {calculateAge(child.dateOfBirth)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                onClick={() => addChildToGroup(child)}
                                className="cursor-pointer"
                                disabled={group.children.some(
                                  (c) => c.id === child.id
                                )}
                              >
                                {group.children.some((c) => c.id === child.id)
                                  ? "Child is added to group"
                                  : "Add child to group"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 mb-10">No children found.</p>
                  )}
                  {searchResults.length > childrenPerPage && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={prevPage} />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">
                            {currentPage}
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext href="#" onClick={nextPage} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}

                  <h3 className="text-lg font-medium mb-2">
                    Children in group
                  </h3>
                  {group.children.length > 0 ? (
                    <Table className="mb-2">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead className="w-[150px]">Name</TableHead>
                          <TableHead className="w-[150px]">Surname</TableHead>
                          <TableHead className="w-[150px]">
                            Date of birth
                          </TableHead>
                          <TableHead className="w-[100px]">Age</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentGroupChildren.map((child, index) => (
                          <TableRow key={child.id}>
                            <TableCell>
                              {indexOfFirstGroupChild + index + 1}
                            </TableCell>
                            <TableCell>{child.name}</TableCell>
                            <TableCell>{child.surname}</TableCell>
                            <TableCell>
                              {
                                new Date(child.dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </TableCell>
                            <TableCell>
                              {calculateAge(child.dateOfBirth)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                onClick={() => removeChildFromGroup(child.id)}
                                className="cursor-pointer"
                              >
                                <FontAwesomeIcon icon={faXmark} />
                                Remove child from group
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500">
                      Group is empty. Please add children.
                    </p>
                  )}
                  {group.children.length > childrenInGroupPerPage && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={prevGroupPage}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">
                            {currentGroupPage}
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext href="#" onClick={nextGroupPage} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>
    </>
  );
};

export default GroupForm;
