import {Table, Grid, Button, Form } from 'react-bootstrap';
import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import ethergram from './ethergram';

class App extends Component {
 
    state = {
      ipfsHash:null,
      buffer:'',
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: '',
      textInput: [] 
    };
   
    captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)    
      };

    convertToBuffer = async(reader) => {
      //file is converted to a buffer to prepare for uploading to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
        this.setState({buffer});
    };

    onClick = async () => {

    try{
        this.setState({blockNumber:"waiting.."});
        this.setState({gasUsed:"waiting..."});

        // get Transaction Receipt in console on click
        // See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
        await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
          console.log(err,txReceipt);
          this.setState({txReceipt});
        }); //await for getTransactionReceipt

        await this.setState({blockNumber: this.state.txReceipt.blockNumber});
        await this.setState({gasUsed: this.state.txReceipt.gasUsed});    
      } //try
    catch(error){
        console.log(error);
      } //catch
  } //onClick

    onSubmit = async (event) => {
      event.preventDefault();

      //bring in user's metamask account address
      const accounts = await web3.eth.getAccounts();
     
      console.log('Sending from Metamask account: ' + accounts[0]);

      //obtain contract address from ethergram.js
      const ethAddress= await ethergram.options.address;
      this.setState({ethAddress});

      //save document to IPFS,return its hash#, and set hash# to state
      //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
      await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        console.log(err,ipfsHash);
        //setState by setting ipfsHash to ipfsHash[0].hash 
        this.setState({ ipfsHash:ipfsHash[0].hash });

        // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
        //return the transaction hash from the ethereum contract
        //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
        
        ethergram.methods.makeGram(this.state.ipfsHash,this.state.textInput[0],this.state.textInput[1],this.state.textInput[2],this.state.textInput[3]).send({
          from: accounts[0] 
        }, (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({transactionHash});
        }); //ethergram 
      }) //await ipfs.add 
    }; //onSubmit 


    handleTextChange(e) {
      var arr = e.target.value.split("#");
      this.setState({textInput: arr});
   };
   
  
    render() {
      
      return (
        <div className="App">
          <div className="header">
      <div className="container">
        <div className="row">
          <div className="col-xs-2">
            <h1>feedster</h1>
          </div>
          <div className="col-xs-7">
          </div>
          
          <div className="col-xs-2">
            <h1 className="menu">menu</h1>
          </div>
        </div>
      </div>
    </div>
   

  <div className='nav-menu'>
    <div className='container-nav'>
      <ul>
        <li>Bang Bang</li>
        <li>Mexican-Chinese</li>
        <li>Indo-Scandinavian</li>
        <li>Polish-Korean</li>
      </ul>
      <ul>
        <li>Contact</li>
        <li>Twitter</li>
        <li>Facebook</li>
        <li>Instagram</li>
      </ul>
    </div>
  </div>
    
    <Form className="newPost" onSubmit={this.onSubmit}>
      <div className="container">
        <div className="post">
          <img className="avatar" src="https://s3.amazonaws.com/codecademy-content/courses/jquery+jfiddle+test/feedster/profile-purple.svg"/>
          <h3 className='name'>YOUR NAME HERE</h3>
          <textarea className="postText" placeholder="What's on your mind?" value={this.state.textInput} onChange={this.handleTextChange}></textarea>
          <p className="wordcount"><span className='characters'>140</span> characters remaining</p>
          <p><input 
              type = "file"
              onChange = {this.captureFile}
            /></p>
          <div className="button-holder">
            <button type="submit" className="btn-post">POST</button>
            <button type="submit" className="btn-post">WORD COUNT</button>
          </div>
        </div>
      </div>
    </Form>
    
    <div className="posts">
      <div className="container">
        <div className="post">
          <img className="avatar" src="https://s3.amazonaws.com/codecademy-content/courses/jquery+jfiddle+test/feedster/profile-teal.svg"/>
          <h3>Ivory Breath</h3>
          <p>Buffalo bulgogi, are you kidding me!?! Do yourself a favor and head to this restaurant.</p>
          <button className="btn">+1</button>
        </div>

        <div className="post">
          <img className="avatar" src="https://s3.amazonaws.com/codecademy-content/courses/jquery+jfiddle+test/feedster/profile-yellow.svg"/>
          <h3>Bacon West</h3>
          <p>Tacos, sausage, fundido, saurkraut and more! 10/10 would recommend.</p>
          <button className="btn">+1</button>
        </div>
        
      </div>
    </div>
   
     </div>
      );
    } //render
}

export default App;
