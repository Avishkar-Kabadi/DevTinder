import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../store/feedSlice";
import { baseUrl } from "../utils/constants";
import Post from "../components/Post";
import CreatePost from "../components/CreatePost";
import PostSkeleton from "../components/PostSkeleton";
import { RefreshCw } from "lucide-react";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);


  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPosts = React.useCallback(async (isRefetch = false) => {
    if (isRefetch) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await axios.get(`${baseUrl}/api/posts`, { withCredentials: true });
      dispatch(addFeed(res.data));
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    // Only fetch initially if feed empty to save Network, 
    // unless they hit refresh.
    if (!feed || feed.length === 0) {
      fetchPosts();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-4 md:py-8 w-full max-w-2xl mx-auto">

      {/* Refresh Header */}
      <div className="w-full flex justify-end px-2">
        <button
          onClick={() => fetchPosts(true)}
          disabled={isRefreshing}
          className="btn btn-sm btn-ghost text-gray-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Feed</span>
        </button>
      </div>

      <div className="w-full flex flex-col gap-6 px-2 sm:px-0">
        <CreatePost />

        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : feed && feed.length > 0 ? (
          feed.map((post) => (
            <Post key={post._id} post={post} />
          ))
        ) : (
          <div className="flex flex-col justify-center items-center py-10 px-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-300">No posts down here</h2>
            <p className="text-center text-gray-500 max-w-sm">
              Follow some users or check back later to see new posts in your feed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;