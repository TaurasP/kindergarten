import { useLocation } from "react-router-dom";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faXmark,
  faPlus,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "@/components/ui/navbar";
import icon from "@/assets/icon.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Child } from "@/models/Child";
import { useContext, useState } from "react";

const Group: React.FC = () => {
  const location = useLocation();
  const group = location.state?.group;
  const [currentPage, setCurrentPage] = useState(1);
  const childrenPerPage = 10;
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [filteredChildren, setFilteredChildren] = useState(group.children);

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

  const sortedChildren = filteredChildren.sort(
    (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)
  );
  const indexOfLastChild = currentPage * childrenPerPage;
  const indexOfFirstChild = indexOfLastChild - childrenPerPage;
  const currentChildren = sortedChildren.slice(
    indexOfFirstChild,
    indexOfLastChild
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredChildren.length / childrenPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!group) {
    return <div>No group data available.</div>;
  }

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
                  <h1 className="text-3xl mb-5">Group "{group.name}"</h1>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <Button
                        id="child-add-to-group"
                        variant="default"
                        //   onClick={() => navigate("/child-form")}
                        className="cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <input
                        type="text"
                        placeholder="Search by name, surname, date of birth, or age"
                        className="border border-gray-300 rounded px-4 py-2 ml-3 h-9 w-120"
                        onChange={(e) => {
                          const searchTerm = e.target.value.toLowerCase();
                          const filteredChildren = group.children.filter(
                            (child: Child) => {
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
                          setCurrentPage(1);
                          setFilteredChildren(filteredChildren);
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
                          <TableCell className="text-right">
                            <Button
                              id="child-info"
                              variant="default"
                              //   onClick={() =>
                              //     navigate(`/groups/${group.id}`, {
                              //       state: { group },
                              //     })
                              //   }
                              className="cursor-pointer mr-2"
                            >
                              <FontAwesomeIcon icon={faInfo} />
                            </Button>
                            <Button
                              id="child-edit"
                              variant="default"
                              // onClick={() =>
                              //   navigate(`/group-form/${group.id}`, {
                              //     state: { group },
                              //   })
                              // }
                              className="cursor-pointer mr-2"
                            >
                              <FontAwesomeIcon icon={faPencil} />
                            </Button>
                            <Button
                              id="group-delete"
                              variant="default"
                              //   onClick={}
                              className="cursor-pointer"
                              //   disabled={group.children.length === 0}
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {group.children.length > childrenPerPage && (
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

export default Group;
