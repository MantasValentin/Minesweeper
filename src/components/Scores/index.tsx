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
      setScores(scoreList.slice(0, 20));
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
