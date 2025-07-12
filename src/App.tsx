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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      <main>
        <SleepApneaSurvey />
      </main>
    </div>
  );
}

export default App;
