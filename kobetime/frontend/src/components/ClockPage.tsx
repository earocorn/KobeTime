import { useEffect, useState } from "react"
import { validateAccessClock } from "../employee";
import Clock from "./Clock";


function ClockPage() {
    const [valid, setValid] = useState<boolean | null>(null);

    useEffect(() => {
      validateAccessClock()
        .then((dist) => {
          const threshold = 0.5;
          const isValid = dist >= 0 && dist <= threshold;
          setValid(isValid);
        })
        .catch((error) => {
          console.error(error);
          setValid(false);
        });
    }, []);
    
    if (valid === null) {
        return (
        <div>Loading...</div>
        )
    }

    return (
      <>
        {valid ? (
          <Clock/>
        ) : (
          <h1 style={{ color: "red", display: "flex", justifyContent: "center" }}>
            Access denied.
          </h1>
        )}
      </>
    );
}

export default ClockPage;