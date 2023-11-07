import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../../contractJSON/App.json';
import { Web3Provider } from '@ethersproject/providers';
import { useDispatch } from 'react-redux';
import { setContract } from '../../redux';
import { message } from 'antd';
const Template = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [reload, setReload] = useState(false);
  const dispatch = useDispatch();
  try {
    window.ethereum.on('accountsChanged', async (accounts) => {
      if (!accounts.length) {
        localStorage.removeItem('account');
        dispatch(setContract(null));
        setAccount(null);
      } else {
        setReload(true);
      }
    });
  } catch (e) {
    message.error('cannot find MataMask wallet');
    message.error('please install MataMask wallet extension ');
  }
  // messgae 0x9e795874E53e745Badc7f44a682299B35d864307
  // app 0xE40439e97b32c3e1E8b4e45FCa9F86ae17d771a8
  // app new 0x3d13c9613429753DF4A847B93184494aEcCB3998
  useEffect(() => {
    const contractAddress = '0x3d13c9613429753DF4A847B93184494aEcCB3998';
    const contractABI = abi.abi;

    const loadBlockchainData = async () => {
      const { ethereum } = window;
      if (ethereum) {
        try {
          const account = await ethereum.request({
            method: 'eth_requestAccounts',
          });

          setAccount(account);
          localStorage.setItem('account', account[0]);
          const provider = new Web3Provider(ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          dispatch(setContract({ provider, signer, contract }));
          setReload(false);
        } catch (e) {
          console.log(e.message);
        }
      } else {
        console.error('MetaMask or web3 not found');
      }
    };

    loadBlockchainData();
  }, [reload]);

  return (
    <div>
      {account ? (
        <p className='lg:text-sm font-semibold leading-6 break-all lg:break-normal lg:text-white -mx-3 block rounded-lg px-3 py-2 text-base  text-gray-900 '>Wallet Address: {account}</p>
      ) : (
        <p>Please connect your MetaMask wallet.</p>
      )}
      {children}
    </div>
  );
};

export default Template;
