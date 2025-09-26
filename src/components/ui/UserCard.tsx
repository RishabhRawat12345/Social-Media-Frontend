"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";

interface UserCardProps {
  username: string;
}

const UserCard: React.FC<UserCardProps> = ({ username }) => {
  const router = useRouter();

  const goToProfile = () => {
    router.push(`/profile/${username}`);
  };

  return (
    <div
      className="flex items-center mb-2 cursor-pointer"
      onClick={goToProfile}
    >
      <User className="w-6 h-6 mr-2 text-gray-300" />
      <span className="font-medium text-white">{username}</span>
    </div>
  );
};

export default UserCard;
