import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../store/feedSlice";
import { baseUrl } from "../utils/constants";
import UserCard from "./UserCard";
const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const fetchFeed = async () => {
    try {
      const res = await axios.get(baseUrl + "/api/feed", {
        withCredentials: true,
      });
      const feed = res.data?.data ?? [];
      dispatch(addFeed(feed));
    } catch (error) {}
  };

  useEffect(() => {
    if (feed) return;
    fetchFeed();
  }, []);

  return (
    feed &&
    feed?.length != 0 && (
      <div className="flex justify-center lg:my-2  -z-1 py-2">
        <UserCard user={feed[0]} />
      </div>
    )
  );
};

export default Feed;
