import { BrowserRouter as Router, Routes, Route } from "react-router";
import Landing from "@/react-app/pages/Landing";
import Dashboard from "@/react-app/pages/Dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
