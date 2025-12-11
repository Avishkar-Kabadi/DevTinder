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

  if (!feed) return;

  if (feed.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center lg:my-2  -z-1 py-2">
        <h2 className="text-2xl font-semibold mb-4">No more users in feed</h2>
        <p className="text-center text-gray-600">
          You've viewed all the users available in your feed. Please check back
          later for new users to connect with!
        </p>
      </div>
    );
  }

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
