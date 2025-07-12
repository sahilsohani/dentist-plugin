import Header from "./components/Header";
import Breadcrumb from "./components/Breadcrumb";
import SleepApneaSurvey from "./components/SleepApneaSurvey";
import "./App.css";

function App() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Patients", href: "/patients" },
    { label: "Sleep Apnea Survey", current: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-oid="3qk9y4q">
      <Header data-oid="3xemdr8" />
      <Breadcrumb items={breadcrumbItems} data-oid="l8t4qgv" />
      <main data-oid=":x_du6i">
        <SleepApneaSurvey data-oid="4w2at-m" />
      </main>
    </div>
  );
}

export default App;
