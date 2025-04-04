import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "@/components/ui/navbar";
import icon from "@/assets/icon.png";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { Child } from "@/models/Child";
import { Group } from "@/models/Group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

const Children: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [childrenResponse, setChildrenResponse] = useState<Data[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const childrenPerPage = 10;
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const handleLogout = () => {
    authContext?.logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchChildrenAndGroups = async () => {
      try {
        const childrenResponse = await axios.get<Child[]>(
          "http://localhost:8080/children",
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );

        const groupsResponse = await axios.get<Group[]>(
          "http://localhost:8080/groups",
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );

        setGroups(groupsResponse.data);

        const childrenWithGroupNames = childrenResponse.data.map((child) => {
          const group = groupsResponse.data.find(
            (group) => group.id === child.groupId
          );
          return { ...child, groupName: group ? group.name : "-" };
        });

        setChildrenResponse(childrenWithGroupNames);
        const sortedChildren = childrenWithGroupNames.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setChildren(sortedChildren);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchChildrenAndGroups();
  }, []);

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

  const handleDeleteChild = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8080/children/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setChildren((prevChildren) =>
        prevChildren.filter((child) => child.id !== Number(id))
      );
      setChildrenResponse((prevChildrenResponse) =>
        prevChildrenResponse.filter((child) => child.id !== id)
      );
    } catch (error) {
      console.error("Error deleting child:", error);
    }
  };

  const indexOfLastChild = currentPage * childrenPerPage;
  const indexOfFirstGroup = indexOfLastChild - childrenPerPage;
  const currentChildren = children.slice(indexOfFirstGroup, indexOfLastChild);

  const nextPage = () => {
    if (currentPage < Math.ceil(children.length / childrenPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
                    className="ml-5 font-semibold"
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
              <div className="flex flex-col justify-between bg-gray-120">
                <div className="flex-grow">
                  <h1 className="text-3xl mb-5">Children</h1>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <Button
                        id="child-add"
                        variant="default"
                        onClick={() => navigate("/child-form")}
                        className="cursor-pointer mr-3"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Add new child
                      </Button>
                      <input
                        type="text"
                        placeholder="&#128269;  Search by name, surname, date of birth or age"
                        className="border border-gray-300 rounded-md px-4 py-2 w-120"
                        style={{ height: "37px" }}
                        onChange={(e) => {
                          const searchTerm = e.target.value.toLowerCase();
                          const filteredChildren = childrenResponse.filter(
                            (child) => {
                              const age = calculateAge(
                                child.dateOfBirth
                              ).toString();
                              return (
                                child.name.toLowerCase().includes(searchTerm) ||
                                child.surname
                                  .toLowerCase()
                                  .includes(searchTerm) ||
                                new Date(child.dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                                  .includes(searchTerm) ||
                                age.includes(searchTerm)
                              );
                            }
                          );
                          setChildren(filteredChildren);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead className="w-[150px]">Name</TableHead>
                        <TableHead className="w-[150px]">Surname</TableHead>
                        <TableHead className="w-[150px]">
                          Date of birth
                        </TableHead>
                        <TableHead className="w-[100px]">Age</TableHead>
                        <TableHead className="w-[150px]">Group</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentChildren.map((child: Child, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
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
                          <TableCell
                            style={{
                              color:
                                child.groupName === "-" ? "#858586" : "black",
                            }}
                          >
                            {child.groupName}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              id="child-edit"
                              variant="default"
                              className="cursor-pointer mr-2"
                            >
                              <FontAwesomeIcon icon={faPencil} />
                              Edit child
                            </Button>
                            <Button
                              id="child-delete"
                              variant="default"
                              className="cursor-pointer"
                              onClick={() =>
                                handleDeleteChild(child.id.toString())
                              }
                            >
                              <FontAwesomeIcon icon={faXmark} />
                              Remove child
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {children.length > childrenPerPage && (
                  <Pagination className="mt-auto pt-5">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={prevPage} />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">{currentPage}</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" onClick={nextPage} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </header>
        </div>
      </div>
    </>
  );
};

export default Children;
