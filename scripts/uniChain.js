import { Wallet, utils, ethers, BigNumber } from "ethers-v5";

import fs from "fs";


async function main() {
    // 测试网络
    const provider = ethers.getDefaultProvider("https://virtual.sepolia.rpc.tenderly.co/acafa165-85e2-40ac-bf25-337865b9f4d3");

    // 正是网络
    //const provider = ethers.getDefaultProvider("");
    const fileContent = fs.readFileSync("./Mnemonic.json", "utf-8");
    const json = JSON.parse(fileContent);

    for (let i = 0; i < 2; ++i) {
        // 获取第一个账户地址
        const walletsOne = Wallet.fromMnemonic(json.mnemonic, `m/44'/60'/0'/0/${i}`)
        // 获取第二个账户地址以转移gas
        const walletsTwo = Wallet.fromMnemonic(json.mnemonic, `m/44'/60'/0'/0/${i + 1}`)

        // 生成钱包实例
        const wallet = new ethers.Wallet(walletsOne.privateKey, provider);

        // const factory = new ethers.ContractFactory([], "0x600a600c600039600a6000f3602a60005260206000f3", wallet);

        // // 部署合约
        // const contract = await factory.deploy();
        // console.log("Contract deployment transaction sent. Waiting for confirmation...");

        // // 获取交易哈希
        // console.log("Tx hash:", contract.deployTransaction.hash);

        // // 等待交易确认
        // const receipt = await contract.deployTransaction.wait();
        // console.log("Contract successfully deployed at:", contract.address);
        // console.log("Transaction confirmed in block:", receipt.blockNumber);

        //TODO: 转账存在问题
        // 获取钱包剩余Gas
        let balance = await provider.getBalance(wallet.address);
        let gasPrcie = 250000000n;
        let gasLimit = 21000n;
        let balanceOnly = balance - BigNumber.from(gasPrcie * gasLimit)
        console.log("Balance:", balanceOnly)
        console.log("Balance:", balance.toString)

        // 获取当前用户nonce
        //nonce = await provider.getTransactionCount(walletsOne.address)
        console.log("nonce:", await provider.getTransactionCount(walletsOne.address))

        // 转移balance
        let tx = await wallet.sendTransaction({
            to: walletsTwo.address,
            value: "111",
            gasPrice: gasPrcie.toString(),
            gasLimit: gasLimit.toString(),
            nonce: await provider.getTransactionCount(walletsOne.address),
        });
        console.log("tx:", tx.hash);

        await tx.wait();
        console.log("Balance to up", await provider.getBalance(wallet));

    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
