import './App.css'


const App = () => {
  const uploadImage =async (event) => {
    const files = event.target.files
    console.log('files', files)
    const form = new FormData()
    for (let i = 0; i < files.length; i++){
      form.append('files',files[i],files[i].name)
    }
    try {
      // const config = {
      //       headers: {
      //           'content-type': 'application/json',
      //       },
      //   }
      let request = await fetch('/upload', {
        method: 'post',
        body: form,
        
      })
      const response = await request.json()
      console.log('Response',response)
    } catch (err) {
      alert('error uploading files')
      console.log('Error uploading the files',err)
    }
  }
  return (
    <div>
      <h1>Image Upload</h1>
      <input type='file' multiple onChange={event=>uploadImage(event)}/>
    </div>
  )
}



export default App
