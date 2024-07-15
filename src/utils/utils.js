import CryptoJS from "crypto-js";
import { Asset, BASE_FEE, Horizon, Keypair, Networks, Operation, TransactionBuilder } from "diamante-sdk-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const server = new Horizon.Server('https://diamtestnet.diamcircle.io/');

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const createWallet = () => {
    const pair = Keypair.random();
    return {
        public_key: pair.publicKey(),
        secret_key: pair.secret(),
    }
}

export const encrypt = (data, keyword) => {
    const encrypteData = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        keyword
    )
    return encrypteData.toString();
}

export const decrypt = (item, keyword) => {
    try {
        const decryptedData = CryptoJS.AES.decrypt(item, keyword).toString(
            CryptoJS.enc.Utf8
        );
        const decryptedDataJson = JSON.parse(decryptedData);
        return decryptedDataJson;
    } catch (error) {
        return null;
    }
};

export const getBalance = async (pubKey) => {
    let balance;
    try {
        const server = new Horizon.Server("https://diamtestnet.diamcircle.io/");
        const account = await server.accounts().accountId(pubKey).call();
        balance = parseFloat(account.balances[account.balances.length - 1].balance);

        return balance;
    } catch (e) {
        balance = 0;
        return balance;
    }
};

export async function transferDiam(senderKepair, reciverPublicKey, amount) {
    // checking if both account exist on ledger or not
    let senderAcc = await server.loadAccount(senderKepair.publicKey());
    let reciverAcc = await server.loadAccount(reciverPublicKey);

    let transaction = new TransactionBuilder(senderAcc, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    }).addOperation(Operation.payment({
        destination: reciverPublicKey,
        asset: Asset.native(),
        amount: amount,
    })).setTimeout(30).build();

    transaction.sign(senderKepair);

    const result = await server.submitTransaction(transaction);

    return result;
}

export async function transferAssets(senderKepair, reciverPublicKey, asset, amount) {
    // checking if both account exist on ledger or not
    let senderAcc = await server.loadAccount(senderKepair.publicKey());
    let reciverAcc = await server.loadAccount(reciverPublicKey);

    let transaction = new TransactionBuilder(senderAcc, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(
            Operation.payment({
                destination: reciverPublicKey,
                asset: asset,
                amount: amount,
            })
        )
        .setTimeout(30)
        .build();

    transaction.sign(senderKepair);

    const result = await server.submitTransaction(transaction);

    return result;
}

export async function changeTrust(reciverKeypair, asset, limit) {
    // checking if  account exist on ledger or not
    let reciverAcc = await server.loadAccount(reciverKeypair.publicKey());

    let transaction = new TransactionBuilder(reciverAcc, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    }).addOperation(Operation.changeTrust({
        asset: asset,
        limit: limit
    })).setTimeout(30).build();

    transaction.sign(reciverKeypair);

    let result = await server.submitTransaction(transaction);
    return result;
}