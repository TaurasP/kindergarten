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
  faInfo,
  faPencil,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

interface GroupResponse {
  id: number;
  name: string;
  children: Child[];
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [groupResponse, setGroupResponse] = useState<GroupResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 10;
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const handleLogout = () => {
    authContext?.logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get<GroupResponse[]>(
          "http://localhost:8080/groups",
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );
        setGroupResponse(response.data);
        const groupsData = response.data.sort(
          (a: { name: string }, b: { name: string }) =>
            a.name.localeCompare(b.name)
        );
        setGroups(groupsData);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleDeleteGroup = async (groupId: number) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await axios.delete(`http://localhost:8080/groups/${groupId}`, {
          headers: { Authorization: localStorage.getItem("token") },
        });
        const updatedGroups = groups.filter((group) => group.id !== groupId);
        setGroups(updatedGroups);
        setGroupResponse(updatedGroups);
      } catch (error) {
        console.error("Error deleting group:", error);
        alert("Failed to delete the group. Please try again.");
      }
    }
  };

  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = groups.slice(indexOfFirstGroup, indexOfLastGroup);

  const nextPage = () => {
    if (currentPage < Math.ceil(groups.length / groupsPerPage)) {
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
                    className="ml-5 font-semibold"
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
                  <h1 className="text-3xl mb-5">Groups</h1>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      <Button
                        id="group-add"
                        variant="default"
                        onClick={() => navigate("/group-form")}
                        className="cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Add new group
                      </Button>
                      <input
                        type="text"
                        placeholder="&#128269;  Search by group name or number of children in the group"
                        className="border border-gray-300 rounded-md px-4 py-2 ml-3 w-120"
                        style={{ height: "37px" }}
                        onChange={(e) => {
                          const searchTerm = e.target.value.toLowerCase();
                          const filteredGroups = groupResponse.filter(
                            (group) =>
                              group.name.toLowerCase().includes(searchTerm) ||
                              group.children.length
                                .toString()
                                .includes(searchTerm)
                          );
                          setGroups(filteredGroups);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead className="w-[150px]">Group</TableHead>
                        <TableHead className="w-[100px]">Children</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentGroups.map((group, index) => (
                        <TableRow key={group.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{group.name}</TableCell>
                          <TableCell
                            style={{
                              color:
                                group.children.length === 0
                                  ? "#858586"
                                  : "black",
                            }}
                          >
                            {group.children.length === 0
                              ? "-"
                              : group.children.length}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              id="group-info"
                              variant="default"
                              onClick={() =>
                                navigate(`/groups/${group.id}`, {
                                  state: { group },
                                })
                              }
                              className="cursor-pointer mr-2"
                              disabled={group.children.length === 0}
                            >
                              <FontAwesomeIcon icon={faInfo} />
                              View group
                            </Button>
                            <Button
                              id="group-edit"
                              variant="default"
                              onClick={() =>
                                navigate(`/group-form/${group.id}`, {
                                  state: { group },
                                })
                              }
                              className="cursor-pointer mr-2"
                            >
                              <FontAwesomeIcon icon={faPencil} />
                              Edit group
                            </Button>
                            <Button
                              id="group-delete"
                              variant="default"
                              onClick={() => handleDeleteGroup(group.id)}
                              className="cursor-pointer mr-2"
                            >
                              <FontAwesomeIcon icon={faXmark} />
                              Remove group
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {groups.length > groupsPerPage && (
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

export default Groups;
