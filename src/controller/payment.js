const Payment = require('../models/payment');
const Enrollment = require('../models/enrollment');
const Wallet = require('../models/wallet');
const Transaction = require('../models/transaction');
const Course = require('../models/course');
const User = require('../models/user');
const paystackService = require('../services/paystackService');

class PaymentController {
  /**
   * =========================
   * INITIATE COURSE PAYMENT
   * =========================
   */
  async purchaseCourse(req, res) {
    try {
      const userId = req.user._id;
      const { courseId, paymentMethod, redirectUrl } = req.body;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const student = await User.findById(userId);

      const amount = course.price;
      const reference = paystackService.generateReference();

      /**
       * =========================
       * WALLET PAYMENT FLOW
       * =========================
       */
      if (paymentMethod === 'wallet') {
        const wallet = await Wallet.findOne({ userId });

        if (!wallet || wallet.balance < amount) {
          return res.status(402).json({ message: 'Insufficient wallet balance' });
        }

        const balanceBefore = wallet.balance;

        wallet.debit(amount);
        await wallet.save();

        const payment = await Payment.create({
          userId,
          courseId,
          amount,
          paymentMethod: 'wallet',
          status: 'completed',
          transactionReference: reference,
          paidAt: new Date(),
          metadata: { redirectUrl },
        });

        await Transaction.create({
          walletId: wallet._id,
          userId,
          transactionType: 'course_purchase',
          amount,
          description: `Purchased course ${course.title}`,
          courseId,
          paymentId: payment._id,
          status: 'completed',
          reference,
          processedAt: new Date(),
          balanceSnapshot: {
            previous: balanceBefore,
            new: wallet.balance,
          },
        });

        await Enrollment.create({
          studentId: userId,
          userId,
          courseId,
          instructorId: course.instructorId,
          status: 'active',
          paymentStatus: 'paid',
          amountPaid: amount,
        });

        const redirect = `${redirectUrl}?status=success&reference=${reference}&courseId=${courseId}`;

        return res.redirect(redirect);
      }

      /**
       * =========================
       * PAYSTACK INIT
       * =========================
       */
      const payment = await Payment.create({
        userId,
        courseId,
        amount,
        paymentMethod: 'paystack',
        paymentGateway: 'paystack',
        transactionReference: reference,
        status: 'pending',
        metadata: { redirectUrl },
      });

      const callbackUrl = `${process.env.BACKEND_URL}/payments/verify/${reference}`;

      const paystack = await paystackService.initializeTransaction({
        email: student.email,
        amount,
        reference,
        callback_url: callbackUrl,
        metadata: {
          userId,
          courseId,
          paymentId: payment._id,
          redirectUrl,
        },
      });

      if (!paystack.success) {
        return res.status(400).json(paystack);
      }

      return res.status(200).json({
        success: true,
        authorization_url: paystack.data.data.authorization_url,
        reference,
      });
    } catch (err) {
      console.error('purchaseCourse error:', err);
      return res.status(500).json({ message: 'Payment failed' });
    }
  }

  /**
   * =========================
   * VERIFY PAYMENT (BOOKING STYLE)
   * =========================
   */
  async verifyPayment(req, res) {
    try {
      const { reference } = req.params;

      const verification = await paystackService.verifyTransaction(reference);

      if (
        !verification.success ||
        !verification.data?.data ||
        verification.data.data.status !== 'success'
      ) {
        const redirectFail =
          verification?.data?.data?.metadata?.redirectUrl || '/';

        return res.redirect(`${redirectFail}?status=failed`);
      }

      const meta = verification.data.data.metadata;

      /**
       * PREVENT DOUBLE PAYMENT
       */
      const existingPayment = await Payment.findOne({
        transactionReference: reference,
      });

      if (existingPayment && existingPayment.status === 'completed') {
        return res.redirect(
          `${meta.redirectUrl}?status=success&reference=${reference}`
        );
      }

      const { userId, courseId, redirectUrl } = meta;

      const course = await Course.findById(courseId);
      const user = await User.findById(userId);

      /**
       * MARK PAYMENT COMPLETE
       */
      const payment = await Payment.findOne({
        transactionReference: reference,
      });

      payment.status = 'completed';
      payment.paidAt = new Date();
      await payment.save();

      /**
       * CREATE ENROLLMENT
       */
      await Enrollment.create({
        studentId: userId,
        userId,
        courseId,
        instructorId: course.instructorId,
        status: 'active',
        paymentStatus: 'paid',
        amountPaid: payment.amount,
      });

      const redirect = `${redirectUrl}?status=success&amount=${payment.amount}&reference=${reference}`;

      return res.redirect(redirect);
    } catch (err) {
      console.error('verifyPayment error:', err);
      return res.status(500).send('Payment verification failed');
    }
  }

  /**
   * =========================
   * USER PAYMENT HISTORY
   * =========================
   */
  async getUserPayments(req, res) {
    try {
      const payments = await Payment.find({ userId: req.user._id })
        .populate('courseId')
        .sort({ createdAt: -1 });

      return res.json(payments);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to fetch payments' });
    }
  }
}

module.exports = new PaymentController();