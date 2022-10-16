import type { NextPage } from "next"
import {
  Card,
  Tooltip,
  Illustration,
  Modal,
  useNotification,
  Input,
  Button,
} from "web3uikit"
import nftAbi from "../constants/XchaingeToken.json"
import xchaingeAbi from "../constants/Xchainge.json"

import { useMoralis, useWeb3Contract } from "react-moralis"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { SellNFTModal } from "./SellNFTModal"
import { UpdateListingModal } from "./UpdateListingModal"

interface NFTBoxProps {
  price?: number
  nftAddress: string
  tokenId: string
  xchaingeAddress: string
  seller?: string
}

const truncateStr = (fullStr: string, strLen: number) => {
  if (fullStr.length <= strLen) return fullStr

  const separator = "..."

  var sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2)

  return (
    fullStr.substr(0, frontChars) +
    separator +
    fullStr.substr(fullStr.length - backChars)
  )
}

const NFTBox: NextPage<NFTBoxProps> = ({
  price,
  nftAddress,
  tokenId,
  xchaingeAddress,
  seller,
}: NFTBoxProps) => {
  console.log(xchaingeAddress)
  const { chainId, isWeb3Enabled, account } = useMoralis()
  const [imageURI, setImageURI] = useState<string | undefined>()
  const [tokenName, setTokenName] = useState<string | undefined>()
  const [tokenDescription, setTokenDescription] = useState<string | undefined>()
  // State to handle display of 'create listing' or 'update listing' modal
  const [showModal, setShowModal] = useState(false)
  const hideModal = () => setShowModal(false)
  const isListed = seller !== undefined
  console.log("marketplace")
  console.log(xchaingeAddress)

  const dispatch = useNotification()

  const { runContractFunction: getTokenURI, data: tokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId: tokenId,
    },
  })

  const { runContractFunction: buyItem, error: buyError } = useWeb3Contract({
    abi: xchaingeAbi,
    contractAddress: xchaingeAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
    // This doesn't exist
    // overrides: {},
  })

  async function updateUI() {
    console.log(`TokenURI is: ${tokenURI}`)
    // We are cheating a bit here...
    if (tokenURI) {
      const requestURL = (tokenURI as string).replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      )
      const tokenURIResponse = await (await fetch(requestURL)).json()
      const imageURI = tokenURIResponse.image
      const imageURIURL = (imageURI as string).replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      )
      setImageURI(imageURIURL)
      setTokenName(tokenURIResponse.name)
      setTokenDescription(tokenURIResponse.description)
    }
  }

  useEffect(() => {
    updateUI()
  }, [tokenURI])

  useEffect(() => {
    isWeb3Enabled && getTokenURI()
  }, [isWeb3Enabled])

  // These only work on valid chains, sorry - doesn't work locally
  // const options: tokenIdMetadataParams = {
  //     chain: chainId!.toString() as chainType,
  //     address: nftAddress,
  //     token_id: tokenId.toString(),
  // }

  // const { fetch, data, error, isLoading } = useMoralisWeb3ApiCall(
  //     Web3Api.token.getTokenIdMetadata,
  //     options
  // )
  // const getTokenIdMetadata = async () => {
  //     try {
  //         const result = await Web3Api.token.getTokenIdMetadata(options)
  //         console.log(result)
  //     } catch (e) {
  //         console.log(e)
  //     }
  // }

  const isOwnedByUser = seller === account || seller === undefined
  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15)

  const handleCardClick = async function () {
    if (isOwnedByUser) {
      setShowModal(true)
    } else {
      console.log(xchaingeAddress)
      await buyItem({
        onSuccess: () => handleBuyItemSuccess(),
        onError: (error) => {
          console.log(error)
        },
      })
    }
  }

  let btn_gap = {
    margin: "5px",
    "border-radius": "15px",
  }

  const handleBuyItemSuccess = () => {
    dispatch({
      type: "success",
      message: "Item bought successfully",
      title: "Item Bought",
      position: "topR",
    })
  }

  const tooltipContent = isListed
    ? isOwnedByUser
      ? "Update listing"
      : "Buy Now"
    : "Create listing"

  return (
    <div className="p-2">
      <SellNFTModal
        isVisible={showModal && !isListed}
        imageURI={imageURI}
        nftAbi={nftAbi}
        nftMarketplaceAbi={xchaingeAbi}
        nftAddress={nftAddress}
        tokenId={tokenId}
        onClose={hideModal}
        nftMarketplaceAddress={xchaingeAddress}
      />
      <UpdateListingModal
        isVisible={showModal && isListed}
        imageURI={imageURI}
        nftMarketplaceAbi={xchaingeAbi}
        nftAddress={nftAddress}
        tokenId={tokenId}
        onClose={hideModal}
        nftMarketplaceAddress={xchaingeAddress}
        currentPrice={price}
      />
      <div className="flex justify-center">
        <div className="flex flex-col md:flex-row md:max-w-xl rounded-lg bg- shadow-lg listing">
          <Tooltip content={tooltipContent} position="top">
            <div className="p-2">
              {imageURI ? (
                <div className=" id flex flex-col font-bold  gap-2">
                  <div>#{tokenId} </div>
                  <div className=" text-sm ">
                    Owned by {formattedSellerAddress}
                  </div>
                  <a href="#" className="relative block border-none border-gray-100">
                    <Image
                      className=" w-full h-96 md:h-auto object-cover md:w-48 rounded-t-lg md:rounded md:rounded-l-lg"
                      loader={() => imageURI}
                      src={imageURI}
                      height="200"
                      width="200"
                    />
                  </a>
                </div>
              ) : (
                <div className="flex flex-col  gap-1">
                  <Illustration height="180px" logo="marketplace" width="100%" />
                  Loading...
                   </div>
              )}
<div className="des">
  <div >{tokenName}</div>
<div >{tokenDescription}</div>

              <div className="p-1 ">
                {price && (
                  <div className="font-bold ">
                    {ethers.utils.formatEther(price)} MATIC
                  </div>
                )}
              </div>





</div>
              

              <div>
                <button
                  type="button"
                  style={btn_gap}
                  className="mt-4 inline-block  rounded-lg bg-blue-500 p-4 text-sm font-medium"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  style={btn_gap}
                  className="mt-4 block inline-block rounded-sm bg-yellow-500 p-4 text-sm font-medium"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
export default NFTBox
