import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import { Container } from '@mui/system';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  listAll,
  deleteObject,
} from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';

import './filepages.css';
const FilesPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const storage = getStorage();
  const inputRef = useRef(null);

  const getAllFiles = () => {
    const storageRef = ref(storage, `public`);
    listAll(storageRef)
      .then((res) => {
        setFiles(res.items);
        setUploading(false);
        console.log(res.items);
      })
      .catch((err) => console.log(err));
  };

  let intervalId;

  useEffect(() => {
    getAllFiles();
    intervalId = setInterval(() => getAllFiles(), 10000);
    return ()=>{
        clearInterval(intervalId);
    }
  }, []);


  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log(e.type);
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploading(true);
    if (e.dataTransfer.files) {
      let fileList = [];
      for (const fileToUpload of e.dataTransfer.files) {
        fileList.push(fileToUpload);
      }
      fileList.map((fileToUpload, index) => {
        const storageRef = ref(storage, `public/${fileToUpload.name}`);
        const task = uploadBytesResumable(storageRef, fileToUpload);
        task.on(
          'state_changed',
          (snapshot) => {
            let percentage =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadPercentage(percentage);
          },
          (error) => setErrorMessage(`Ha ocurrido un error: ${error.message}`),
          () => {
            if(index == fileList.length -1 ){
                getAllFiles();
            }
          }
        );
      });
    }
  };

  const downloadFile = (name) => {
    const storageRef = ref(storage, `public/${name}`);
    getDownloadURL(storageRef)
      .then((downLoadUrl) => {
        fetch(downLoadUrl, { mode: 'no-cors' })
          .then((res) => res.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
      })
      .catch((err) => console.log(err));
  };

  const onDeleteFile = (name) => {
    setUploading(true);
    const storageRef = ref(storage, `public/${name}`);
    deleteObject(storageRef)
      .then(() => getAllFiles())
      .catch((err) => console.log(err));
  };

  const handleFileChange = (e) => {
    setUploading(true);
    if (e.target.files) {
        let fileList = [];
        for (const fileToUpload of e.target.files) {
          fileList.push(fileToUpload);
        }
        fileList.map((fileToUpload, index) => {
          const storageRef = ref(storage, `public/${fileToUpload.name}`);
          const task = uploadBytesResumable(storageRef, fileToUpload);
          task.on(
            'state_changed',
            (snapshot) => {
              let percentage =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadPercentage(percentage);
            },
            (error) => setErrorMessage(`Ha ocurrido un error: ${error.message}`),
            () => {
              if(index == fileList.length -1 ){
                  getAllFiles();
              }
            }
          );
        });
    }
  };

  const buttonUpload = () => {
    inputRef.current.click();
  };

  return (
    <Container>
      <Paper
        elevation={2}
        sx={{ height: '90vh', position: 'relative', overflow: 'hidden' }}
        onDragEnter={handleDrag}
      >
        {uploading && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress sx={{ height: 10 }} value={uploadPercentage} />
          </Box>
        )}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'gainsboro',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            height: '10vh',
            padding: '0.5rem',
          }}
        >
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Arroje los archivos o utilize el botón de subida
          </Typography>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={buttonUpload}
          >
            Subir archivos
          </Button>
          <input
            style={{ display: 'none' }}
            ref={inputRef}
            type="file"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <div style={{ position: 'absolute', top: '13vh', left: 0, zIndex: 1, height: '90vh' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              padding: '1rem',
              overflow: 'scroll',
              height: '100%',
            }}
          >
            {files.map((file) => (
              <Card sx={{ width: 250 }}>
                <CardContent>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    {file.name}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="outlined"
                    type="primary"
                    size="small"
                    onClick={() => downloadFile(file.name)}
                  >
                    Descargar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDeleteFile(file.name)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {dragActive && (
            <div id="form-file-upload">
              <input type="file" id="input-file-upload" multiple={true} />
              <div
                id="label-file-upload"
                className={dragActive ? 'drag-active' : ''}
              >
                <div
                  id="drag-file-element"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                ></div>
              </div>
            </div>
          )}
        </div>
      </Paper>
    </Container>
  );
};

export default FilesPage;
