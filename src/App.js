// App.js
import React, { useState } from "react";

function App() {
  const [attendance, setAttendance] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const lines = content.split(/\r?\n/);

      // Parse each line into an object (adjust depending on actual format)
      const data = lines.map((line) => {
        const [userId, name, time, workcode] = line.split("\t");
        return { userId, name, time, workcode };
      });

      setAttendance(data.filter((item) => item.userId)); // remove empty lines
    };

    reader.readAsText(file); // Use readAsBinaryString if it's binary
  };

  const grouped = {};
  const scheduledTimeIn = "08:00:00";

  attendance.forEach((rec) => {
    const key = rec.userId;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(rec);
  });

  const results = Object.entries(grouped).map(([key, entries]) => {
    const [userId, date] = key.split("-");

    const timeIns = entries
      .filter((e) => e.punchType === "0")
      .map((e) => e.time);
    const timeOuts = entries
      .filter((e) => e.punchType === "1")
      .map((e) => e.time);

    const earliestIn = timeIns.sort()[0] || null;
    const latestOut = timeOuts.sort().reverse()[0] || null;

    // Late calculation
    const scheduled = new Date(`${date}T${scheduledTimeIn}`);
    const actualIn = new Date(`${date}T${earliestIn}`);
    const isLate = actualIn > scheduled;
    const lateBy = isLate
      ? new Date(actualIn - scheduled).toISOString().substr(11, 8)
      : "00:00:00";

    return {
      userId,
      date,
      timeIn: earliestIn,
      timeOut: latestOut,
      lateBy,
    };
  });

  return (
    <div className="App">
      <h1>ZKTeco K30 Attendance Loader</h1>
      <input type="file" accept=".dat,.txt" onChange={handleFileUpload} />
      <ul>
        {attendance.map((entry, index) => (
          <li key={index}>
            UserID: {entry.userId}, Name: {entry.name}, PunchTime: {entry.time},
            Workcode: {entry.workcode}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
