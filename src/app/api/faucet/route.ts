import { Account, Aptos, AptosConfig, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { NextResponse } from "next/server";

// todo 每次领几个APT？
const TRANSFER_AMOUNT = 100_000_000;
export async function POST(req: Request) {
  if (!process.env.PRIVATE_KEY) {
    return new NextResponse("No private key found", { status: 400 });
  }
  try {
    const { address, network=Network.TESTNET } = await req.json();

    const privateKey = new Ed25519PrivateKey(process.env.PRIVATE_KEY!);
    const adminAccount = Account.fromPrivateKey({ privateKey, legacy: true }); 
    const aptosConfig = new AptosConfig({ network }); 
    const aptos = new Aptos(aptosConfig);
    
    // 验证账号是否存在
    await aptos.account.getAccountInfo({
      accountAddress:address
    })
    const transaction = await aptos.transferCoinTransaction({
      sender: adminAccount.accountAddress,
      recipient: address,
      amount: TRANSFER_AMOUNT,
    });
    const pendingTxn = await aptos.signAndSubmitTransaction({ signer: adminAccount, transaction });
    const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
    return NextResponse.json(response);
    
  } catch (error:any) {
    return new NextResponse(error.message, { status: 500 });
  }
}