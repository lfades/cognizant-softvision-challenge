import React from "react";

import candidatesJson from "../api/candidates.json";
import {LOCAL_STORAGE_ENABLED} from "../api/constants";

import useLocalStorage from "./use-local-storage";
import styles from "./App.module.scss";

const COLUMNS = [
  "Entrevista inicial",
  "Entrevista técnica",
  "Oferta",
  "Asignación",
  "Rechazo",
] as const;

type Columns = typeof COLUMNS[number];

type Candidates = typeof candidatesJson;

type Candidate = Candidates[0];

function App() {
  const [candidates, setCandidates, ready] = useLocalStorage<Candidates>(
    "candidates",
    // The initial value if localStorage is enabled should be an empty array, that should
    // prevent a SSR mismatch, not that it matters because this is not using SSR, but anyway...
    LOCAL_STORAGE_ENABLED ? [] : candidatesJson,
  );
  const firstColumn = COLUMNS[0];

  React.useEffect(() => {
    if (LOCAL_STORAGE_ENABLED && ready && !candidates.length) {
      setCandidates(candidatesJson);
    }
  }, [candidates.length, setCandidates, ready]);

  return (
    <main className={styles.columns}>
      {COLUMNS.map((value, index) => (
        <div key={index} className={styles.column}>
          <h2>{value}</h2>
          <ul className={styles.candidates}>
            {candidates
              .filter((candidate) => candidate.step === value)
              .map((candidate, index) => (
                <Candidate key={index} candidate={candidate} setCandidates={setCandidates} />
              ))}
          </ul>
          {value === firstColumn && (
            <CandidateForm setCandidates={setCandidates} step={firstColumn} />
          )}
        </div>
      ))}
    </main>
  );
}

function Candidate({
  candidate,
  setCandidates,
}: {
  candidate: Candidate;
  setCandidates: React.Dispatch<React.SetStateAction<Candidates>>;
}) {
  const columnIndex = COLUMNS.findIndex((column) => column === candidate.step);
  const prevColumn = COLUMNS[columnIndex - 1];
  const nextColumn = COLUMNS[columnIndex + 1];
  const changeColumn = (column: Columns) => {
    setCandidates((candidates) =>
      candidates.map((c) => {
        if (c.id === candidate.id) {
          c.step = column;
        }

        return c;
      }),
    );
  };

  return (
    <li className={styles.candidate}>
      <div className={styles.info}>
        <p>{candidate.name}</p>
        <p>{candidate.comments}</p>
      </div>
      <div className={styles.actions}>
        {prevColumn ? (
          <button className={styles.button} onClick={() => changeColumn(prevColumn)}>
            &larr;
          </button>
        ) : null}
        {nextColumn ? (
          <button className={styles.button} onClick={() => changeColumn(nextColumn)}>
            &rarr;
          </button>
        ) : null}
      </div>
    </li>
  );
}

function CandidateForm({
  step,
  setCandidates,
}: {
  step: Columns;
  setCandidates: React.Dispatch<React.SetStateAction<Candidates>>;
}) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [error, setError] = React.useState("");

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as any;
        const name = form.name.value;
        const comments = form.comments.value;

        if (error) setError("");
        setCandidates((candidates) => {
          if (candidates.some((c) => c.name === name)) {
            setError("No se vale repetir candidato, valora tu tiempo che.");

            // Return the same state to avoid a re-render
            return candidates;
          }

          setIsAdding(false);

          return [...candidates, {id: name, step, name, comments}];
        });
      }}
    >
      {isAdding && (
        <>
          <input required name="name" placeholder="Nombre" type="text" />
          <input name="comments" placeholder="Comentario" type="text" />
        </>
      )}
      {error && <p>{error}</p>}
      <div className={styles.formActions}>
        {isAdding && (
          <button className={styles.button} type="submit">
            Agregar
          </button>
        )}
        <button
          className={styles.button}
          type="button"
          onClick={() => {
            if (error) setError("");
            setIsAdding(!isAdding);
          }}
        >
          {isAdding ? "Cancelar" : "Agregar candidato"}
        </button>
      </div>
    </form>
  );
}

export default App;
