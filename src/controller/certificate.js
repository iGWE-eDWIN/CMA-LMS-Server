const crypto = require('crypto');
const Certificate = require('../models/certificate');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course')

class CertificateController {

  /**
   * Generate Certificate
   * Admin Only
   */
  async generateCertificate(req, res) {
    try {
      const { enrollmentId } = req.params;

      const enrollment = await Enrollment.findById(
        enrollmentId
      )
        .populate('userId')
        .populate('courseId');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      if (enrollment.progressPercentage < 100) {
        return res.status(400).json({
          success: false,
          message:
            'Student has not completed this course',
        });
      }

      const existingCertificate =
        await Certificate.findOne({
          userId: enrollment.userId._id,
          courseId: enrollment.courseId._id,
        });

      if (existingCertificate) {
        return res.status(400).json({
          success: false,
          message:
            'Certificate already generated',
        });
      }

      const certificateId = `CERT-${Date.now()}`;

      const verificationCode =
        crypto.randomBytes(16).toString('hex');

      const certificate =
        await Certificate.create({
          userId: enrollment.userId._id,
          courseId: enrollment.courseId._id,
          instructorId:
            enrollment.instructorId,

          certificateId,
          verificationCode,

          studentSnapshot: {
            name: enrollment.userId.name,
            email: enrollment.userId.email,
          },

          courseSnapshot: {
            title:
              enrollment.courseId.title,
            level:
              enrollment.courseId.level,
            duration:
              enrollment.courseId.duration,
          },

          completionDate: new Date(),
          status: 'issued',
        });

      enrollment.certificateIssued = true;
      enrollment.certificateId =
        certificate._id;

      await enrollment.save();

      return res.status(201).json({
        success: true,
        message:
          'Certificate generated successfully',
        data: certificate,
      });
    } catch (error) {
      console.error(
        'Generate Certificate Error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to generate certificate',
      });
    }
  }

  /**
   * Student Certificates
   */
  async getMyCertificates(req, res) {
    try {
      const certificates =
        await Certificate.find({
          userId: req.user._id,
          status: 'issued',
        })
          .populate(
            'courseId',
            'title thumbnail'
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: certificates.length,
        data: certificates,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch certificates',
      });
    }
  }

  /**
   * Single Certificate
   */
  async getCertificate(req, res) {
    try {
      const { certificateId } = req.params;

      const certificate =
        await Certificate.findById(
          certificateId
        )
          .populate(
            'courseId',
            'title thumbnail'
          )
          .populate(
            'userId',
            'name email'
          );

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message:
            'Certificate not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: certificate,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch certificate',
      });
    }
  }

  /**
   * Verify Certificate
   */
  async verifyCertificate(req, res) {
    try {
      const { verificationCode } =
        req.params;

      const certificate =
        await Certificate.findOne({
          verificationCode,
          status: 'issued',
        })
          .populate(
            'courseId',
            'title'
          )
          .populate(
            'userId',
            'name'
          );

      if (!certificate) {
        return res.status(404).json({
          success: false,
          verified: false,
          message:
            'Certificate not found',
        });
      }

      return res.status(200).json({
        success: true,
        verified: true,
        data: {
          certificateId:
            certificate.certificateId,
          student:
            certificate.studentSnapshot,
          course:
            certificate.courseSnapshot,
          completionDate:
            certificate.completionDate,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        verified: false,
        message:
          'Verification failed',
      });
    }
  }

  /**
   * Revoke Certificate
   * Admin Only
   */
  async revokeCertificate(req, res) {
    try {
      const { certificateId } =
        req.params;

      const { reason } = req.body;

      const certificate =
        await Certificate.findById(
          certificateId
        );

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message:
            'Certificate not found',
        });
      }

      certificate.revoke(
        reason || 'Revoked by admin'
      );

      await certificate.save();

      return res.status(200).json({
        success: true,
        message:
          'Certificate revoked successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to revoke certificate',
      });
    }
  }
}

module.exports =
  new CertificateController();