import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import {Web3Service} from './util/web3.service';
import {Observable} from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';


const grubscan_artifacts = require('../../build/contracts/Grubscan.json');
const contract = require('truffle-contract');
declare var window: any;
const Web3 = require('web3');
const ipfsAPI = require('ipfs-api');
const Buffer = require('buffer/').Buffer;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'grubscan';
  Grubscan = contract(grubscan_artifacts);
  grubscanInstance: any;

  account: any;
  accounts: any;
  web3: any;

  private play = {
    qrCode: 'Hello',
  };

  private qrCode: any;


  constructor(private _ngZone: NgZone, private http: HttpClient) {}

  @HostListener('window:load')
  windowLoaded() {
    this.checkAndInstantiateWeb3();
    this.onReady();
    const ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});
    console.log(ipfs);
    const files = [
      {
        path: '/home/dope_vector/util.txt',
        content: Buffer.from('This is good')
      }
    ];

    ipfs.files.add(files, function (err, filer) {
        console.log(JSON.stringify(filer));
    });
  }

  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source.'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected, falling back to Infura Ropsten'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')

      );
    }
  }

  public getHistory = () => {
    let grubscanInstance, counter;
    this.Grubscan.deployed().then(function (instance) {
      grubscanInstance = instance;
      return grubscanInstance.historyCount();
    }).then(function(historyCount) {
      counter = 0;
      for (let i = 1; i <= historyCount; i++) {
        grubscanInstance.historyLogs(i).then(function(history) {
          counter++;
          const id = history[0];
          const company = history[1];
          const date = history[2];
          const process = history[3];
          const chemical = history[4];

          const jsondata = 'id:' + id + ', company: ' + company + ', date: ' + date + ',process : ' + process + ',chemical: ' + chemical;
          localStorage.setItem(counter, jsondata);
          // console.log(JSON.parse(JSON.stringify(localStorage.getItem(counter))));
          localStorage.setItem('finalCount', counter);
        });
      }
      counter = localStorage.getItem('finalCount');
      console.log(counter);
      const dataArray = new Array();
      for (let i = 0; i < counter; i++) {
        dataArray.push(localStorage.getItem(i.toString()));
      }
      console.log(JSON.stringify(dataArray));

      return JSON.stringify(dataArray);
    }).then((peace) => {
      this.play.qrCode = peace;
    }).catch(function(error) {
      console.warn(error);
    });
  }

  getCookie = (data) => {
    return localStorage.getItem(data);
  }

  setCookie = (data, value) => {
      return localStorage.setItem(data, value);
  }

  addHistory = (form: NgForm) => {
    let acc1, acc2;
    console.log(form.value);
    const company = form.value.company;
    const batchId = form.value.batchId;
    const date1 = form.value.date1;
    const date2 = form.value.date2;
    const date3 = form.value.date3;
    const chem1 = form.value.chem1;
    const chem2 = form.value.chem2;
    const chem3 = form.value.chem3;
    const process1 = form.value.process1;
    const process2 = form.value.process2;
    const process3 = form.value.process3;

    const post = [
      {
        id: 'x',
        field: '1',
        company : company,
        date : date1,
        process : process1,
        chemical : chem1
      },
      {
        id: 'x',
        field: '2',
        company : company,
        date : date2,
        process : process2,
        chemical : chem2
      },
      {
        id: 'x',
        field: '2',
        company : company,
        date : date3,
        process : process3,
        chemical : chem3
      }
    ];
    console.log(post);
    this.sendPosts(post);

    acc1 = this.accounts[0];
    acc2 = this.accounts[1];
    this.Grubscan.deployed().then(function(instance) {
      const dateObj = new Date(date1);
      const month = dateObj.getUTCMonth() + 1;
      const day = dateObj.getUTCDate();
      const year = dateObj.getUTCFullYear();
      const newdate = year + '/' + month + '/' + day;

      return instance.addHistory(company, newdate, process1, chem1, {from: acc1, to: acc2, gasLimit: 21000, gasPrice: 2000000000});
    }).then(function(result) {
      console.log(result);
    }).catch(function(err) {
      console.error(err);
    });
  }

  getPosts = (postId) => {
    this.http.get('http://localhost:9000/v1/posts/' + postId).subscribe(res => {
        const jsonResults = JSON.parse(JSON.stringify(res));
        const id = jsonResults._id;
        const postObject = jsonResults.post;
        console.log(id);
        console.log(postObject);
    });
  }

  sendPosts = (posts) => {
    console.log("Log entry post " + posts);
    const req = this.http.post('http://localhost:9000/v1/posts/', {post : JSON.stringify(posts)} )
      .subscribe(
        res => {
          const jsonResults = JSON.parse(JSON.stringify(res));
          const id = jsonResults._id;
          const postObject = jsonResults.post;
          console.log(id);
          console.log(postObject);
          console.log(JSON.parse(JSON.stringify(res)));
          this.qrCode = 'http://localhost:9000/v1/posts/' + id;
        },
        err => {
          console.log(err);
        }
      );
  }

  onReady = () => {
    // Bootstrap the Grubscan abstraction for Use.
    this.Grubscan.setProvider(this.web3.currentProvider);
    // Get the initial account balance so it can be displayed.
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert(
          'You are not connected to an Ethereum client. You can still browse the data, but you will not be able to perform transactions.'
        );
        return;
      }
      this.accounts = accs;
      this.account = this.accounts[0];

      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() => {
        // Initial loading of UI
        // Load balances or whatever
      });

    });
  }

}
