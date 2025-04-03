import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
// import Navigation from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "@/components/ui/navbar";
import rockingHorseIcon from "@/assets/rocking-horse.png";
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
import { faInfo } from "@fortawesome/free-solid-svg-icons";

interface GroupResponse {
  id: number;
  name: string;
  children: Child[];
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [groupResponse, setGroupResponse] = useState<Data[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 20;
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
                    <img
                      src={rockingHorseIcon}
                      alt="Rocking Horse Icon"
                      className="h-15 w-15"
                    />{" "}
                  </a>
                  {/* <Navigation /> */}
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
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell key={index}>{group.name}</TableCell>
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
                              className="cursor-pointer"
                              disabled={group.children.length === 0}
                            >
                              <FontAwesomeIcon icon={faInfo} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
              </div>
            </div>
          </header>
        </div>
      </div>
    </>
  );
};

export default Groups;
