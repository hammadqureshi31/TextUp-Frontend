import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { MdOutlineGroupAdd } from "react-icons/md";
import { fetchUserDetails } from "../../redux/slice/userSlice";
import GroupCard from "../../pages/Groups/GroupCard";
import { useTranslation } from "react-i18next";

const GroupList = ({currentTab}) => {
  
  const { t } = useTranslation();
  const selector = useSelector((state) => state.currentUser.data);
  const [user, setUser] = useState();
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserDetails());
  }, []);

  useEffect(() => {
    console.log(selector);
    if (selector) {
      setUser(selector);
      setLoading(false);
      if(selector.myGroups?.length > 0){
        setGroups(selector.myGroups);
      }
    }
  }, [selector?.myGroups?.length]);

  const handleNavigate = () => {
    if (window.innerWidth >= 786) {
      navigate("/textup?tab=groups&create=group");
    } else {
      navigate("/textup/groups/create");
    }
  };

  return (
    <div className="w-full h-full text-[#334E83] pt-2.5 bg-white rounded-t-3xl flex flex-col justify-start text-center">
      <div className="h-1 w-8 2xl:w-12 bg-gray-300 mx-auto rounded-full"></div>

      <div
        className="flex items-center justify-start gap-5 py-4 px-5 w-full cursor-pointer"
        onClick={() => {
          handleNavigate();
        }}
      >
        <div className="p-3 border border-dashed rounded-full bg-[#334E83]">
          <MdOutlineGroupAdd className=" text-2xl text-white 2xl:text-3xl" />
        </div>
        <h3 className="font-semibold font-poppins text-[#334E83] 2xl:text-xl">
          {t("Create New Group")}
        </h3>
      </div>

      {groups?.length > 0 &&
      groups.map((grp)=>(<GroupCard grp={grp} currentTab={currentTab} key={grp?._id}/>))}
    </div>
  );
};

export default GroupList;
