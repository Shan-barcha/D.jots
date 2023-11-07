/* eslint-disable react/prop-types */
import { Button, Modal, message } from 'antd';
// import { ethers } from 'hardhat';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Progress } from 'antd';

const ArticleHash = () => {
  const contract = useSelector((state) => state.productsSlice.contract);

  const [formValues, setFormValues] = useState({
    name: '',
    note: '',
  });
  const [state, setItemModal] = useState({
    open: '',
    loading: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [hash, setHash] = useState(null);
  const [fileDetails, setFileDetails] = useState({
    fileName: '',
    fileSize: '',
    lastModified: '',
  });
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setHash(null);
    setProgress(0);

    if (file) {
      calculateHash(file);
      const fileName = file.name;
      const fileSize = file.size + ' bytes';
      const lastModified = file.lastModified;
      const lastModifiedDate = new Date(lastModified).toLocaleString();
      setFileDetails({
        fileName: fileName,
        fileSize: fileSize,
        lastModified: lastModifiedDate,
      });
    }
  };

  const calculateHash = (file) => {
    const chunkSize = 700 * 1024 * 1024; // 700 MB chunks (adjust as needed)
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const fileReader = new FileReader();

    const processChunk = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);

      const blob = file.slice(start, end);
      fileReader.readAsArrayBuffer(blob);
    };

    fileReader.onload = (e) => {
      const arrayBuffer = e.target.result;
      crypto.subtle.digest('SHA-256', arrayBuffer).then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('');
        setHash(hashHex);

        currentChunk++;
        const currentProgress = (currentChunk / chunks) * 100;
        setProgress(currentProgress);

        if (currentChunk < chunks) {
          processChunk();
        }
      });
    };

    fileReader.onerror = () => {
      // Handle errors
      message.error('Error reading file');
    };

    processChunk();
  };
  const handleModalOpen = () => {
    setItemModal({
      open: true,
      loading: false,
    });
  };
  const handleCancel = () => {
    setItemModal({
      open: false,
      loading: false,
    });
  };
  const handleOk = async () => {
    console.log(formValues.name, formValues.artileTitle);
    const transaction = await contract?.contract.blockArticles(
      formValues.name,
      fileDetails.fileName,
      fileDetails.size,
      fileDetails.lastModified,
      {
        gasLimit: 3000000,
      }
    );
    await transaction.wait();
  };
  const handleInputChange = (fieldName, newValue) => {
    setFormValues((prevState) => ({
      ...prevState,
      [fieldName]: newValue,
    }));
  };

  return (
    <div>
      <button
        className="bg-blue-500 px-4 py-3 w-full text-xl rounded text-white"
        onClick={handleModalOpen}
      >
        upload hash
      </button>
      <Modal
        title="Notes"
        open={state.open}
        confirmLoading={state.loading}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={[
          <Button key="submit" onClick={handleOk}>
            Submit
          </Button>,
        ]}
      >
        <div className="flex flex-col">
          <input
            id="name"
            name="name"
            type="text"
            placeholder="name"
            className="px-2 outline-none border h-[40px] border-[#D9D9D9] rounded-md"
            onChange={(e) => handleInputChange('name', e.target.value)}
            value={formValues.name}
          />
          <input
            id="data"
            name="data"
            type="text"
            placeholder="Article Title"
            className="p-2 outline-none border border-[#D9D9D9] rounded-md mt-2 resize-none "
            onChange={(e) => handleInputChange('artileTitle', e.target.value)}
            value={formValues.artileTitle}
          />
          <input
            id="fileName"
            name="fileName"
            type="text"
            placeholder="file name"
            className="p-2 outline-none border border-[#D9D9D9] rounded-md mt-2 resize-none "
            value={fileDetails.fileName}
            disabled={true}
          />
          <input
            id="size"
            name="size"
            type="text"
            placeholder="size"
            className="p-2 outline-none border border-[#D9D9D9] rounded-md mt-2 resize-none "
            value={fileDetails.fileSize}
            disabled={true}
          />
          <input
            id="lastModified"
            name="lastModified"
            type="text"
            placeholder="Last Modified"
            className="p-2 outline-none border border-[#D9D9D9] rounded-md mt-2 resize-none "
            value={fileDetails.lastModified}
            disabled={true}
          />
          <input
            id="articleHash"
            name="articleHash"
            type="text"
            placeholder="Article Hash"
            className="p-2 outline-none border border-[#D9D9D9] rounded-md mt-2 resize-none "
            value={hash}
            disabled={true}
          />
          <input className="mt-2" type="file" onChange={handleFileChange} />
          {progress > 0 && progress < 100 && (
            <div className="mt-2">
              <div>Progress: {progress.toFixed(2)}%</div>
              <Progress percent={progress} />
            </div>
          )}
          {/* <progress value={50} max={100} className="w-full bg-slate-500" /> */}
        </div>
      </Modal>
    </div>
  );
};

export default ArticleHash;
