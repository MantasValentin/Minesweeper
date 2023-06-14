import { useEffect, useState } from "react";
import "./index.scss";
import { firestore } from "../../App";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Props {
  currentDiff: string;
}

interface Score {
  score: string | number;
  name: string;
  diff: string;
}

const Scores: React.FC<Props> = ({ currentDiff }) => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    getScores();
  }, [currentDiff]);

  const getScores = async () => {
    try {
      const scoresDocRef = collection(firestore, "scores");
      const q = query(scoresDocRef, where("diff", "==", currentDiff));
      const querySnapshot = await getDocs(q);
      let scoreList: any = [];
      querySnapshot.forEach((doc) => {
        let data: any = doc.data();
        scoreList = [data, ...scoreList];
      });
      scoreList.sort(
        (a: Score, b: Score) => (a.score as number) - (b.score as number)
      );
      setScores(scoreList.slice(0, 10));
    } catch (error) {
      console.log("Failed to get scores", error);
    }
  };

  return (
    <div className="scores">
      {scores.map((item, index) => (
        <div key={index}>
          {index + 1}: {item.score ? item.score : ""}{" "}
          {item.name ? item.name : ""}
        </div>
      ))}
    </div>
  );
};

export default Scores;


// import { useEffect, useState } from "react";
// import "./index.scss";
// import { firestore } from "../../App";
// import { collection, getDocs, query, where } from "firebase/firestore";

// interface Props {
//   currentDiff: string;
// }

// interface Score {
//   score: string | number;
//   name: string;
//   diff: string;
// }

// const Scores: React.FC<Props> = ({ currentDiff }) => {
//   const [bScores, setBScores] = useState<Score[]>([]);
//   const [iScores, setIScores] = useState<Score[]>([]);
//   const [eScores, setEScores] = useState<Score[]>([]);
//   const [currentScores, setCurrentScores] = useState<Score[]>([]);
//   const [hasLoaded, setHasLoaded] = useState(false);

//   useEffect(() => {
//     if (!hasLoaded) {
//       getScores("beginner");
//       getScores("intermediate");
//       getScores("expert");
//       setHasLoaded(true);
//       console.log("gay");
//     }
//   }, [currentDiff]);

//   useEffect(() => {
//     switch (currentDiff) {
//       case "beginner":
//         setCurrentScores(bScores);
//         break;
//       case "intermediate":
//         setCurrentScores(iScores);
//         break;
//       case "expert":
//         setCurrentScores(eScores);
//         break;
//     }
//   }, [currentDiff]);

//   const getScores = async (scoreDiff: string) => {
//     try {
//       const scoresDocRef = collection(firestore, "scores");
//       const q = query(scoresDocRef, where("diff", "==", scoreDiff));
//       const querySnapshot = await getDocs(q);
//       let scoreList: any = [];
//       querySnapshot.forEach((doc) => {
//         let data: any = doc.data();
//         scoreList = [data, ...scoreList];
//       });
//       scoreList.sort(
//         (a: Score, b: Score) => (a.score as number) - (b.score as number)
//       );

//       switch (scoreDiff) {
//         case "beginner":
//           setBScores(scoreList.slice(0, 5));
//           break;
//         case "intermediate":
//           setIScores(scoreList.slice(0, 5));
//           break;
//         case "expert":
//           setEScores(scoreList.slice(0, 5));
//           break;
//       }
//     } catch (error) {
//       console.log("Failed to get scores", error);
//     }
//   };

//   return (
//     <div className="scores">
//       {currentScores.map((item, index) => (
//         <div key={index}>
//           {index + 1}: {item.score ? item.score : ""}{" "}
//           {item.name ? item.name : ""}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Scores;
