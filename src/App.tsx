import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Groups from "./components/Groups";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Group from "./components/Group";
import GroupForm from "./components/GroupForm";
import Children from "./components/Children";
import ChildForm from "./components/ChildForm";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <Group />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group-form"
            element={
              <ProtectedRoute>
                <GroupForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group-form/:id"
            element={
              <ProtectedRoute>
                <GroupForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children"
            element={
              <ProtectedRoute>
                <Children />
              </ProtectedRoute>
            }
          />
          <Route
            path="/children/:id"
            element={
              <ProtectedRoute>
                <Children />
              </ProtectedRoute>
            }
          />
          <Route
            path="/child-form"
            element={
              <ProtectedRoute>
                <ChildForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/child-form/:id"
            element={
              <ProtectedRoute>
                <ChildForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
