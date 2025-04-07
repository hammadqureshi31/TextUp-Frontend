import React, { useEffect, useState } from 'react'
import { CiSearch } from "react-icons/ci";
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { HiOutlineUserGroup } from "react-icons/hi2";
import { HiOutlineUserPlus } from "react-icons/hi2";



const HeaderMenu = ({ openModal, setOpenModal }) => {
    const selector = useSelector((state)=>state.currentUser?.data?.details);
    const location = useLocation();
    const [user, setUser] = useState();
    const navigate = useNavigate();
    const [currenTab, setCurrenTab] = useState('Messages');
    let temp = '';
    let temp2 = '';

    useEffect(()=>{
        if(selector){
            setUser(selector);
        }
    }, [selector]);

    useEffect(()=>{
        const urlParams = new URLSearchParams(location.search);
        const params = urlParams.get("tab");
        if(params){
            temp = params.slice(0,1).toUpperCase();
            temp2 = params.slice(1,);
            setCurrenTab(temp+temp2)
        }
    },[location.search])

    const handleNavigate = ()=>{
        if(window.innerWidth >= 786){
          navigate("/textup?tab=groups&create=group")
        }
        else{
          navigate("/textup/groups/create")
        }
      }

  return (
    <div className='flex justify-between text-center px-4 pt-5 2xl:pt-8'>

        <div onClick={()=>navigate("/textup?tab=search")} className='cursor-pointer'>
        <CiSearch className='bg-[#373C51] text-center mt-0.5 text-white text-4xl rounded-full p-1.5 2xl:text-5xl'/>
        </div>

        <div className='font-semibold tracking-wide text-2xl 2xl:text-4xl mt-1 font-acme text-white'>{currenTab}</div>

        <div>
            { currenTab.toLowerCase() === 'messages' && <img src={user?.profilePicture || "./profile-placeholder.webp"} alt="" className=' w-9 h-9 mt-0.5 rounded-full cursor-pointer 2xl:w-12 2xl:h-12' onClick={()=>navigate("/textup?tab=setting")}/>}
            { currenTab.toLocaleLowerCase() === 'groups' && <HiOutlineUserGroup onClick={()=>handleNavigate()}  className='bg-[#3b4369] text-center text-white cursor-pointer size-10 rounded-full p-2 2xl:size-14 '/>}
            { currenTab.toLocaleLowerCase() === 'contacts' && <HiOutlineUserPlus onClick={()=>{setOpenModal(true)}}
            className='bg-[#3b4369] text-center text-white size-10 cursor-pointer rounded-full p-2 2xl:size-14'/>}
            { currenTab.toLocaleLowerCase() === 'setting' && ""}
        </div>
    </div>
  )
}

export default HeaderMenu