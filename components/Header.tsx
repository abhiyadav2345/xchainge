import { ConnectButton, Avatar, Tab, TabList } from "web3uikit"
import { Cart, Home, Sandbox } from "@web3uikit/icons"
import Link from "next/link"


let color={
  'color':'#354259'
};

export default function Header() {
  return (
    <nav className="p-5 border-b-2 flex flex-row  justify-between items-center">
      
      <Link href="/">
        
        <a>
          <h1 style={color}
 className=" py-4 px-4 font-bold text-3xl">Xchainge Protocol </h1>
        </a>
      </Link>

      <div className="flex flex-row items-center">
        <Link href="/">
          {/* Home is going to be the recent listings page */}
          <a className="mr-4 p-6">
            <Home fontSize="30px" />
          </a>
        </Link>
        <Link href="/sell-page">
          {/* This is going to include cancel listings, update listings, and withdraw proceeds */}
          <a className="mr-4 p-6">
            <Sandbox fontSize="30px" />
          </a>
        </Link>
        <Link href="/sell-page">
          {/* This is going to include all the item that are added to cart */}
          <a className="mr-4 p-6">
            <Cart fontSize="30px" />
          </a>
        </Link>
        <ConnectButton moralisAuth={false} />

        <Avatar isRounded theme="image" />
      </div>
    </nav>
  )
}
