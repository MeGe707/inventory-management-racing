import React, { useContext } from 'react'

import { NavLink } from 'react-router-dom'
import { AppContext } from '../Context/AppContext.jsx'



const Sidebar = () => {

    const {token, role, link} = useContext(AppContext)
 
  return (
    <div className='min-h-screen bg-white border-r'>
          {  
           token && <ul className='text-[#515151] mt-5'>


                <NavLink  className={({isActive}) => `flex ittems-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}  to={'/items-list'}>
                    {/* <img src={assets.appointment_icon} alt="" /> */}
                    <p className="hidden md:block">Items List</p>
                </NavLink>

                <NavLink  className={({isActive}) => `flex ittems-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}  to={'/thrash-items'}>
                    {/* <img src={assets.add_icon} alt="" /> */}
                    <p className="hidden md:block">Thrash Box</p>
                </NavLink>

                <NavLink  className={({isActive}) => `flex ittems-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}  to={'/add-item'}>
                    {/* <img src={assets.people_icon} alt="" /> */}
                    <p className="hidden md:block">Add Item</p>
                </NavLink>

                <NavLink  className={({isActive}) => `flex ittems-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}  to={'/add-excel-list'}>
                    {/* <img src={assets.people_icon} alt="" /> */}
                    <p className="hidden md:block">Add Excel</p>
                </NavLink>

                {(role === "admin" || role === "superadmin") ? (
                 <NavLink  className={({isActive}) => `flex ittems-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}  to={'/users'}>
                    {/* <img src={assets.people_icon} alt="" /> */}
                    <p className="hidden md:block">Users</p>
                </NavLink> ) : null}

                 {role === "superadmin" ? (
                 <NavLink  className={({isActive}) => `flex ittems-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}  to={'/admins'}>
                    {/* <img src={assets.people_icon} alt="" /> */}
                    <p className="hidden md:block">Admins</p>
                </NavLink> ) : null}
                
                {(role === "superadmin" || role === "admin") ? 
                <NavLink  className={({isActive}) => `flex ittems-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}  to={'/logs'}>
                    {/* <img src={assets.people_icon} alt="" /> */}
                    <p className="hidden md:block">Logs</p>
                </NavLink> : null
                }
                
            </ul>
         

        }
        

        
    </div>
  )
}

export default Sidebar