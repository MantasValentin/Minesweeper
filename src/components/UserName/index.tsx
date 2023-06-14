import "./index.scss";

interface Props {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
}

const UserName: React.FC<Props> = ({ userName, setUserName }) => {
  return (
    <div className="user-name-position">
      <div className="user-name">
        <input
          className="user-name-input"
          type="text"
          name={"name"}
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        ></input>
      </div>
    </div>
  );
};

export default UserName;
