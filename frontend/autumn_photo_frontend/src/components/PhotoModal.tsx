import React, { useEffect, useState } from "react";
import axios from "../services/axiosinstances";
import { Heart, Star, Download, Share2, X } from "lucide-react";
import { usePhotoCommentSocket } from "../utils/usePhotoCommentSocket";

interface Props {
  photoId: number;
  photoUrl: string;
  onClose: () => void;
}
interface PhotoDetail {
  id: number;
  original_file: string;
  tags: Record<string, number>;
  likes_count: number;
  comments_count: number;
  favourites_count: number;
  person_tags: any[];
}


const PhotoModal: React.FC<Props> = ({ photoId, photoUrl, onClose }) => {
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{id: number, userName: string} | null>(null);
  const [liked, setLiked] = useState(false);
  const [favourited, setFavourited] = useState(false);
  const [tagUser, setTagUser] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/photos/${photoId}/`);
      const norm = (s: string | null | undefined) => {
        if (!s) return s;
        return s.startsWith("http") ? s : `http://127.0.0.1:8000${s}`;
      };
      const data = res.data;
      if (data?.original_file) data.original_file = norm(data.original_file);
      setDetail(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/photos/${photoId}/comments/`);
      setComments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchComments();
    const t = setInterval(() => {
      fetchDetail();
      fetchComments();
    }, 1500);
    return () => clearInterval(t);
  }, [photoId]);

  usePhotoCommentSocket(photoId, (newComment) => {
    setComments((prevComments) => {
      if (!newComment.parent_comment_id) {
        if (prevComments.some(c => c.id === newComment.id)) return prevComments;
        return [newComment, ...prevComments];
      }

      const addReplyRecursively = (list: any[]): any[] => {
        return list.map(c => {
          if (c.id === newComment.parent_comment_id) {
            const replies = c.replies || [];
            if (replies.some((r: any) => r.id === newComment.id)) return c;
            return { ...c, replies: [...replies, newComment] };
          } else if (c.replies && c.replies.length > 0) {
            return { ...c, replies: addReplyRecursively(c.replies) };
          }
          return c;
        });
      };
      return addReplyRecursively(prevComments);
    });
  });

  const toggleLike = async () => {
    try {
      const res = await axios.post(`/photos/${photoId}/like/`);
      setLiked(res.data.liked ?? !liked);
      fetchDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavourite = async () => {
    try {
      const res = await axios.post(`/photos/${photoId}/favourite/`);
      setFavourited(res.data.favourited ?? !favourited);
      fetchDetail();
    } catch (e) {
      console.error(e);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`/photos/${photoId}/comments/add/`, { 
        text: newComment,
        parent_comment_id: replyingTo?.id || null 
      });
      setNewComment("");
      setReplyingTo(null);
      fetchDetail();
    } catch (e) {
      console.error(e);
    }
  };

 const tagPerson = async () => {
  if (!tagUser.trim()) return;
  try {
    await axios.post(`/photos/${photoId}/tag/`, {
      tagged_user: tagUser.trim(),
    });
    setTagUser("");
    fetchDetail(); 
  } catch (e) {
    console.error(e);
  }
};



  const downloadOriginal = async () => {
    try {
      setDownloading(true);
      const norm = (s: string | null | undefined) => {
        if (!s) return s;
        return s.startsWith("http") ? s : `http://127.0.0.1:8000${s}`;
      };
      const url = norm(detail?.original_file || photoUrl);
      
      const response = await fetch(url || "");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `photo_${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
     
      window.URL.revokeObjectURL(blobUrl);
      setDownloading(false);
    } catch (e) {
      console.error(e);
      setDownloading(false);
      alert("Failed to download image");
    }
  };

  const shareLink = async () => {
    try {
      const shareUrl = window.location.origin + `/photos/${photoId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to copy link");
    }
  };

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-900 text-white rounded-xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-3 border-b border-gray-800 shrink-0">
          <div className="font-semibold">Photo</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800">
            <X />
          </button>
        </div>

        <div className="flex flex-col md:flex-row overflow-hidden">
          <div className="md:flex-1 bg-black flex items-center justify-center overflow-hidden">
            <img src={detail?.original_file || photoUrl} alt="photo" className="max-h-full max-w-full object-contain" />
          </div>

          <div className="w-full md:w-96 p-4 border-l border-gray-800 overflow-y-auto flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-4 shrink-0">
              <button onClick={toggleLike} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{detail?.likes_count ?? 0}</span>
              </button>

              <button onClick={toggleFavourite} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Star className="w-4 h-4" />
                <span className="text-sm">{detail?.favourites_count ?? 0}</span>
              </button>

              <button 
                onClick={downloadOriginal} 
                disabled={downloading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">{downloading ? "Downloading..." : "Download"}</span>
              </button>

              <button 
                onClick={shareLink} 
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>

            <div className="mb-4 shrink-0">
              <div className="font-medium mb-2">Tag someone</div>
              <div className="flex gap-2">
                <input value={tagUser} onChange={(e)=>setTagUser(e.target.value)} placeholder="enter email address " className="flex-1 p-2 bg-gray-800 rounded" />
                <button onClick={tagPerson} className="px-3 py-2 bg-black-600 rounded">Tag</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="font-medium mb-2 sticky top-0 bg-gray-900 py-1 z-10">Comments</div>
              <div className="space-y-3 pb-4">
                {comments.length ? (
                  <div className="space-y-3">
                    {function renderCommentTree(commentList: any[], depth = 0) {
                      return commentList.map(c => (
                        <div key={c.id} className={`${depth > 0 ? 'ml-4 mt-2 border-l-2 border-gray-700 pl-3' : 'mb-3'}`}>
                          <div className="bg-gray-800/50 p-2.5 rounded-lg text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-xs text-indigo-300">@{c.user_name}</div>
                                <div className="text-[10px] text-gray-500">
                                  {new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setReplyingTo({id: c.id, userName: c.user_name});
                                  setNewComment("");
                                }} 
                                className="text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-wider font-semibold bg-gray-700/50 px-2 py-0.5 rounded"
                              >
                                Reply
                              </button>
                            </div>
                            <div className="text-gray-200 mt-1">{c.text}</div>
                          </div>
                          
                          {replyingTo?.id === c.id && (
                            <div className="mt-2 ml-4 flex gap-2 items-center bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                              <div className="flex-1">
                                <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1 px-1">
                                  <span>Replying to <span className="text-indigo-300 font-semibold">@{replyingTo.userName}</span></span>
                                </div>
                                <input 
                                  autoFocus
                                  value={newComment} 
                                  onChange={(e)=>setNewComment(e.target.value)} 
                                  placeholder="Write a reply..." 
                                  className="w-full p-1.5 text-sm bg-gray-900 rounded border border-transparent focus:border-indigo-500 outline-none transition-colors"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') addComment();
                                  }}
                                />
                              </div>
                              <div className="flex flex-col gap-1 shrink-0">
                                <button onClick={addComment} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded text-xs font-medium">Send</button>
                                <button onClick={() => setReplyingTo(null)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 transition-colors rounded text-xs font-medium text-gray-300">Cancel</button>
                              </div>
                            </div>
                          )}

                          {c.replies && c.replies.length > 0 && (
                            <div className="replies mt-2">
                              {renderCommentTree(c.replies, depth + 1)}
                            </div>
                          )}
                        </div>
                      ));
                    }(comments)}
                  </div>
                ) : <div className="text-gray-400 text-sm">No comments yet</div>}
              </div>
            </div>

            {/* Root Comment Input */}
            {!replyingTo && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800 shrink-0">
                <input 
                  value={newComment} 
                  onChange={(e)=>setNewComment(e.target.value)} 
                  placeholder="Add a comment..." 
                  className="flex-1 p-2 bg-gray-800 rounded border border-transparent focus:border-indigo-500 outline-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addComment();
                  }}
                />
                <button onClick={addComment} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded font-medium">Send</button>
              </div>
            )}

            {detail?.person_tags?.length > 0 && (
  <div className="mb-4">
    <div className="font-medium mb-1">Tagged</div>
    <div className="flex flex-wrap gap-2">
      {detail?.person_tags.map((t: any) => (
        <span
          key={t.id}
          className="px-2 py-1 text-sm bg-gray-800 rounded"
        >
          @{t.tagged_user_name}
        </span>
      ))}
    </div>
  </div>
)}
          {detail?.tags && (
  <div className="mt-4">
    <h4 className="text-sm font-semibold text-gray-300 mb-2">
      AI Tags
    </h4>

    <div className="flex flex-wrap gap-2">
      {Object.entries(detail.tags)
        .filter(([_, score]) => Number(score) > 0.05)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 8)
        .map(([tag]) => (
          <span
            key={tag}
            className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
    </div>
  </div>
)}



          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
