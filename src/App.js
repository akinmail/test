import {Table, Grid, Button, Form } from 'react-bootstrap';
import React, { Component } from 'react';
import Metamaskdefined from './metamaskdefined';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import ethergram from './ethergram';
import ethergraminfura from './ethergraminfura';
import akinyemi from './akinyemi.jpg';
var ethers = require('ethers');



class App extends Component {
 
 constructor(props){
   super(props)
   this.state = {
      ipfsHash:null,
      buffer:'',
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: '',
      textInput: '',
      events: [],
      isMetamask:false 
    };

 }

  componentWillMount(){
    if (typeof ethergram == 'undefined') {
    // You have a web3 browser! Continue below!
      this.state.isMetamask=true;         
  } 
        console.log(ethergram)
    console.log(ethergraminfura)
      ethergraminfura.events.gram({
    fromBlock: 0
}, function(error, event){ 
  if (error) {
          console.log(error)
        return;
        }
  console.log(event); })
.on('data', function(event){
    console.log(event); // same results as the optional callback above
})
.on('changed', function(event){
    // remove event from local database
})
.on('error', console.error);
      
  }
    
   
    captureFile(event){
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)    
      }

    async convertToBuffer(reader){
      //file is converted to a buffer to prepare for uploading to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
        this.state.buffer =buffer;
    };

    async onClick (){

    try{
        this.state.blockNumber="waiting..";
        this.state.gasUsed="waiting...";

        // get Transaction Receipt in console on click
        // See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
        await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
          console.log(err,txReceipt);
          this.state.txReceipt=txReceipt;
        }); //await for getTransactionReceipt

        await this.setState({blockNumber: this.state.txReceipt.blockNumber});
        await this.setState({gasUsed: this.state.txReceipt.gasUsed});    
      } //try
    catch(error){
        console.log(error);
      } //catch
  } //onClick

    async onSubmit(event) {
      event.preventDefault();
      //event.
      //bring in user's metamask account address
      const accounts = await web3.eth.getAccounts();
     
      console.log('Sending from Metamask account: ' + accounts[0]);

      //obtain contract address from ethergram.js
      const ethAddress= await ethergram.options.address;
      this.state.ethAddress=ethAddress;

      //save document to IPFS,return its hash#, and set hash# to state
      //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
      console.log(this.state.buffer)
      console.log(ethergram)
      
      await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        console.log(err,ipfsHash);
        if (err) {
          console.log(err)
        return;
        }
        //setState by setting ipfsHash to ipfsHash[0].hash 
        this.state.ipfsHash=ipfsHash[0].hash;

        // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
        //return the transaction hash from the ethereum contract
        //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
        console.log(this.state.ipfsHash);
        var a =this.web3StringToBytes32(this.state.ipfsHash);
        var b=this.web3StringToBytes32(this.state.textInput.split("#")[0]);
        var hashtag1=web3.utils.fromAscii(this.state.textInput.split("#")[1]);
        var hashtag2=web3.utils.fromAscii(this.state.textInput.split("#")[2]);
        var hashtag3=web3.utils.fromAscii(this.state.textInput.split("#")[3]);
        console.log('a=',a)
        console.log('b',b)
        ethergram.methods.makeGram("0x00",'0x00',hashtag1,hashtag2,hashtag3).send({
          from: accounts[0] 
        }, (error, transactionHash) => {
          console.log(transactionHash);
          this.state.transactionHash=transactionHash;
        }); //ethergram 
      }) //await ipfs.add 
    }; //onSubmit 

    handleTextChange(event) {
    this.setState({textInput: event.target.value});
  }

  web3StringToBytes32(text) {
    var result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));
    //while (result.length < 66) { result += '0'; }
    //if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
    return result.substring(0,66);
}
    
   
  
    render() {
      if(this.state.isMetamask){
        return <Metamaskdefined /> 
        
      }else 
      
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
    
    <Form className="newPost" onSubmit={this.onSubmit.bind(this)}>
      <div className="container">
        <div className="post">
          <img className="avatar" src={akinyemi} height="40" width="40"/>
          <h3 className='name'>Akinyemi Akindele @akinmail1</h3>
          <textarea className="postText" placeholder="What's on your mind?" value={this.state.value} onChange={this.handleTextChange.bind(this)}></textarea>
          <p className="wordcount"><span className='characters'>140</span> characters remaining</p>
          <p><input 
              type = "file"
              onChange = {this.captureFile.bind(this)}
            /></p>
          <div className="button-holder">
            <button type="submit" className="btn-post">POST</button>
          </div>
        </div>
      </div>
    </Form>
    <div className="posts">
      <div className="container">

    {this.state.events.map((item,i) => 
    
      
        <div className="post">
          <img className="avatar" src="https://s3.amazonaws.com/codecademy-content/courses/jquery+jfiddle+test/feedster/profile-teal.svg"/>
          <h3>Ivory Breath</h3>
          <p>Buffalo bulgogi, are you kidding me!?! Do yourself a favor and head to this restaurant.</p>
          <button className="btn">+1</button>
        </div>
      
    
    
    
    )}

    </div>
    </div>


     </div>
      );
    } //render
}

export default App;

