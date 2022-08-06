const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Payments', () => {
    let acc1
    let acc2
    let payments
    beforeEach(async () => {
        [acc1, acc2] = await ethers.getSigners()
        const Payments = await ethers.getContractFactory('Payments', acc1)
        payments = await Payments.deploy()
        await payments.deployed()
    })

    it('should be deployed', async () => {
        expect(payments.address).to.be.properAddress;
    })
    it('should have 0 ether by default', async () => {
        const balance = await payments.currentBalance()
        expect(balance).to.eq(0)
    })
    it('should be possible to send funds', async () => {
        const sum = 100
        const msg = 'hello from hardhad'
        const tx = await payments.connect(acc2).pay(msg, { value: sum })


        expect(() => tx)
            .to.changeEtherBalances([acc2, payments], [-sum, sum])
        await tx.wait()

        const newPayment = await payments.getPayment(acc2.address, 0)
        expect(newPayment.message).to.eq(msg);
        expect(newPayment.amount).to.eq(sum);
        expect(newPayment.from).to.eq(acc2.address);
    })
    it('duble should be possible to send funds', async () => {
        const sum = 100
        const msg = 'hello from hardhad'
        const msg2 = 'duble'
        const tx = await payments.connect(acc2).pay(msg, { value: sum })
        const tx2 = await payments.connect(acc1).pay(msg2, { value: sum })

        expect(() => {
            tx
            tx2
        })
            .to.changeEtherBalances([acc1, acc2, payments], [-sum, -sum, 2*sum])
        await tx.wait()
        await tx2.wait()

        const newPayment = await payments.getPayment(acc2.address, 0)
        expect(newPayment.message).to.eq(msg);
        expect(newPayment.amount).to.eq(sum);
        expect(newPayment.from).to.eq(acc2.address);

        const payment2 = await payments.getPayment(acc1.address, 0)
        expect(payment2.message).to.eq(msg2);
        expect(payment2.amount).to.eq(sum);
        expect(payment2.from).to.eq(acc1.address);
    })
})