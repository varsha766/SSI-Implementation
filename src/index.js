
let account;
let chainId;
let didDocument;
const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6ImUxY2ZiMzc0YjYwMTg4YzBkY2YwNTMxMDcwNTNmYjAyZTYxOSIsInVzZXJJZCI6InByYXRhcG1yaWRoYUBnbWFpbC5jb20iLCJncmFudFR5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJpYXQiOjE2NzY2MDk4ODMsImV4cCI6MTY3NjYyNDI4M30.-y9y5j9OoxFqCYVF_24un8eLciXNLdeTGz7hRLUwS6M'
const { HypersignDID } = require('hs-ssi-sdk')
const Web3=require('web3')
document.getElementById("metamaskConnect").addEventListener('click', async () => {
    if (!ethereum) {
        alert("Install Metamusk")
    }
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    account = Web3.utils.toChecksumAddress(accounts[0])
    chainId = await ethereum.request({ method: 'eth_chainId' })
    document.getElementById("address").innerHTML = account
    document.getElementById("chainId").innerHTML = chainId
})



document.getElementById("createDID").addEventListener('click', async () => {
    let resp = await fetch('http://localhost:3001/api/v1/did', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({
            namespace: 'testnet',
            methodSpecificId: "sagdljaxzldliadgasldkgjblasdfsgafslajkbuiubijdhsjkjs",
            options: {
                keyType: 'EcdsaSecp256k1RecoveryMethod2020',
                chainId,
                address:account
            }
        })
    })
    const didDoc = await resp.json()
    didDocument = didDoc.metaData
    document.getElementById('didId').innerHTML = didDoc.did
    document.getElementById('didDoc').innerHTML = JSON.stringify(didDoc.metaData, null, 2)
    console.log(didDocument);
})




document.getElementById('registerDID').addEventListener('click', async () => {
    const hypersignDID = new HypersignDID();
    const web3Obj=new Web3(window.web3.currentProvider)
    window.web3=web3Obj
    const signAndDoc = await hypersignDID.signByClientSpec({
        didDocument:didDocument.didDocument,
        clientSpec: 'eth-personalSign',
        address: account,
        web3: web3Obj

    })
    console.log(signAndDoc);
    const didDoc=signAndDoc.didDocument
    let resp = await fetch('http://localhost:3001/api/v1/did/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({
            didDocument:didDoc,
            verificationMethodId: didDoc.verificationMethod[0].id,
            clientSpec: "eth-personalSign",
            signature:signAndDoc.signature
        })
    })

    console.log(await resp.json());
 

})



document.getElementById('updateDID').addEventListener('click',async ()=>{
    const hypersignDID = new HypersignDID();
    const web3Obj=new Web3(window.web3.currentProvider)

    window.web3=web3Obj
    didDocument.didDocument.verificationMethod.push(
        {
            "id": "did:hid:testnet:0x2325a41Ef8b8f99CF00FAB50e05a6Ef438D21349#key-1",
            "type": "EcdsaSecp256k1RecoveryMethod2020",
            "controller": "did:hid:testnet:0x2325a41Ef8b8f99CF00FAB50e05a6Ef438D21349",
            "blockchainAccountId": "eip155:1:0x2325a41Ef8b8f99CF00FAB50e05a6Ef438D21349"
          }
    )
    const signAndDoc = await hypersignDID.signByClientSpec({
        didDocument:didDocument.didDocument,
        clientSpec: 'eth-personalSign',
        address: account,
        web3: web3Obj

    })
    console.log(signAndDoc);
    const didDoc=signAndDoc.didDocument
    let resp = await fetch('http://localhost:3001/api/v1/did', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({
            didDocument:didDoc,
            verificationMethodId: didDoc.verificationMethod[0].id,
            clientSpec: "eth-personalSign",
            signature:signAndDoc.signature,
            deactivate: false,
        })
    })

    console.log(await resp.json());
})