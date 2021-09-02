import React from "react";

import candidatesJson from "../api/candidates.json";

import styles from "./App.module.scss";

const columns = [
  "Entrevista inicial",
  "Entrevista técnica",
  "Oferta",
  "Asignación",
  "Rechazo",
] as const;

type Columns = typeof columns[number];

type Candidates = typeof candidatesJson;

type Candidate = Candidates[0];

function App() {
  const [candidates, setCandidates] = React.useState<Candidates>(candidatesJson);
  const [isAdding, setIsAdding] = React.useState(false);
  const firstColumn = columns[0];

  return (
    <main className={styles.columns}>
      {columns.map((value, index) => (
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
            <>
              {isAdding && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    const name = form.name.value;
                    const comments = form.comments.value;

                    setCandidates([
                      ...candidates,
                      {
                        id: name,
                        step: firstColumn,
                        name,
                        comments,
                      },
                    ]);
                    setIsAdding(false);
                  }}
                >
                  <input required name="name" placeholder="Nombre" type="text" />
                  <input name="comments" placeholder="Comentario" type="text" />

                  <button type="submit">Agregar</button>
                </form>
              )}
              <button onClick={() => setIsAdding(!isAdding)}>
                {isAdding ? "Cancelar" : "Agregar candidato"}
              </button>
            </>
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
  const columnIndex = columns.findIndex((column) => column === candidate.step);
  const prevColumn = columns[columnIndex - 1];
  const nextColumn = columns[columnIndex + 1];
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
        <p className={styles.name}>{candidate.name}</p>
        <p className={styles.comments}>{candidate.comments}</p>
      </div>
      <div className={styles.actions}>
        {prevColumn ? (
          <button className={styles.arrowButton} onClick={() => changeColumn(prevColumn)}>
            &larr;
          </button>
        ) : null}
        {nextColumn ? (
          <button className={styles.arrowButton} onClick={() => changeColumn(nextColumn)}>
            &rarr;
          </button>
        ) : null}
      </div>
    </li>
  );
}

export default App;
