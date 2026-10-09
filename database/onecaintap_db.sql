-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 09, 2026 at 01:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `onecaintap_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, 3, 'LOGIN', 'User John Doe (resident) logged into ONEcainTAP.', '::1', '2026-10-04 20:59:24'),
(2, 5, 'REGISTER', 'New resident account registered: Jade Mamaril (San Isidro)', '::1', '2026-10-04 21:00:21'),
(3, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-04 21:00:33'),
(4, 1, 'LOGIN', 'User Hon. Maria Elena Nieto (admin) logged into ONEcainTAP.', '::1', '2026-10-04 21:05:52'),
(5, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-04 21:53:08'),
(6, 6, 'REGISTER', 'New resident account registered: buratikels (San Andres)', '::1', '2026-10-04 21:53:52'),
(7, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-04 21:57:40'),
(8, 5, 'NEW_REQUEST', 'Submitted new application for Barangay Certification (REQ-2026-7774)', '::1', '2026-10-04 21:58:21'),
(9, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-04 21:58:30'),
(10, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-04 21:58:43'),
(11, 1, 'STATUS_APPROVED', 'Updated REQ-2026-7774 status to APPROVED.', '::1', '2026-10-04 21:58:52'),
(12, 1, 'STATUS_APPROVED', 'Updated REQ-2026-7774 status to APPROVED.', '::1', '2026-10-04 21:58:57'),
(13, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-04 21:59:04'),
(14, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-09 08:00:39'),
(15, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-09 08:14:38'),
(16, 5, 'NEW_REQUEST', 'Submitted new application for First Time Jobseeker Certificate (RA 11261) (REQ-2026-2644)', '::1', '2026-10-09 08:15:29'),
(17, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-09 08:16:18'),
(18, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-09 08:21:40'),
(19, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-09 08:22:16'),
(20, 7, 'REGISTER', 'New resident account registered: tite ni regino (San Juan)', '::1', '2026-10-09 08:25:45'),
(21, 7, 'LOGIN', 'User tite ni regino (resident) logged into ONEcainTAP.', '::1', '2026-10-09 08:26:15'),
(22, 7, 'NEW_REQUEST', 'Submitted new application for Barangay Certification (REQ-2026-4375)', '::1', '2026-10-09 08:26:30'),
(23, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-09 08:29:16'),
(24, 5, 'NEW_REQUEST', 'Submitted new application for Barangay Certification (REQ-2026-7103)', '::1', '2026-10-09 08:31:44'),
(25, 7, 'LOGIN', 'User tite ni regino (resident) logged into ONEcainTAP.', '::1', '2026-10-09 09:08:46'),
(26, 7, 'NEW_REQUEST', 'Submitted new application for Barangay Certification (REQ-2026-9117)', '::1', '2026-10-09 09:08:57'),
(27, 7, 'NEW_REQUEST', 'Submitted new application for Barangay Certification (REQ-2026-3444)', '::1', '2026-10-09 09:09:30'),
(28, 7, 'NEW_REQUEST', 'Submitted new application for Barangay Certification (REQ-2026-6245)', '::1', '2026-10-09 09:10:13'),
(29, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-09 09:10:56'),
(30, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-09 09:50:43'),
(31, 1, 'STATUS_REJECTED', 'Updated REQ-2026-6245 status to REJECTED. Remarks: dawdwa', '::1', '2026-10-09 09:50:50'),
(32, 1, 'STATUS_REJECTED', 'Updated REQ-2026-3444 status to REJECTED. Remarks: wdasd', '::1', '2026-10-09 09:50:56'),
(33, 1, 'STATUS_REJECTED', 'Updated REQ-2026-9117 status to REJECTED. Remarks: sadasdawd', '::1', '2026-10-09 09:51:01'),
(34, 1, 'STATUS_APPROVED', 'Updated REQ-2026-7103 status to APPROVED. Remarks: wwww', '::1', '2026-10-09 09:51:07'),
(35, 1, 'STATUS_APPROVED', 'Updated REQ-2026-4375 status to APPROVED. Remarks: sadsad', '::1', '2026-10-09 09:51:09'),
(36, 1, 'STATUS_APPROVED', 'Updated REQ-2026-2644 status to APPROVED. Remarks: wdaad', '::1', '2026-10-09 09:51:11'),
(37, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-09 09:51:26'),
(38, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-09 09:52:02'),
(39, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-09 09:54:43'),
(40, 5, 'NEW_REQUEST', 'Submitted new application for Barangay Certification (REQ-2026-2251)', '::1', '2026-10-09 09:56:28'),
(41, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-09 09:56:34'),
(42, 1, 'STATUS_APPROVED', 'Updated REQ-2026-2251 status to APPROVED. Remarks: tite tite tite tite', '::1', '2026-10-09 09:57:38'),
(43, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-09 09:57:49'),
(44, 5, 'NEW_REQUEST', 'Submitted new application for Barangay Clearance (REQ-2026-3239)', '::1', '2026-10-09 09:59:21'),
(45, 1, 'LOGIN', 'User admin (admin) logged into ONEcainTAP.', '::1', '2026-10-09 09:59:39'),
(46, 1, 'STATUS_APPROVED', 'Updated REQ-2026-3239 status to APPROVED.', '::1', '2026-10-09 09:59:41'),
(47, 5, 'LOGIN', 'User Jade Mamaril (resident) logged into ONEcainTAP.', '::1', '2026-10-09 10:00:09');

-- --------------------------------------------------------

--
-- Table structure for table `certificates_catalog`
--

CREATE TABLE `certificates_catalog` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `processing_time` varchar(100) NOT NULL,
  `requirements` text NOT NULL,
  `icon` varchar(50) DEFAULT 'FileText',
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificates_catalog`
--

INSERT INTO `certificates_catalog` (`id`, `name`, `description`, `fee`, `processing_time`, `requirements`, `icon`, `is_active`) VALUES
('barangay_certification', 'Barangay Certification', 'General official certification for various legal or business requirements, lost documents, electric/water meter connection.', 0.00, '1-2 Business Days', '1 Valid ID, Supporting Documents depending on specific purpose', 'FileCheck', 1),
('barangay_clearance', 'Barangay Clearance', 'Official document certifying good moral character, residency, and no derogatory record in the barangay. Required for local employment, police clearance, and postal ID.', 0.00, '1-2 Business Days', '1 Valid Government-Issued ID, Proof of Residency (Utility Bill or Lease Agreement)', 'ShieldCheck', 1),
('certificate_of_indigency', 'Certificate of Indigency', 'Issued to low-income and underprivileged residents for medical assistance (DSWD/PCSO), legal aid (PAO), educational scholarships, or funeral assistance.', 0.00, 'Same Day / 24 Hours', 'Letter request stating specific purpose, Endorsement or Certificate of Low Income', 'HeartHandshake', 1),
('certificate_of_residency', 'Certificate of Residency', 'Proof of actual living residence in Cainta for government transactions, court appearances, banks, and utility applications.', 0.00, '1 Business Day', '1 Valid ID with local address or Barangay Voter Certification', 'Home', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(4, 5, 'Welcome to ONEcainTAP! ', 'Welcome Jade Mamaril! You can now easily request Barangay Clearances, Residency certificates, and Indigency documents anytime from home.', 'info', 0, '2026-10-04 21:00:21'),
(6, 5, 'Request Submitted ', 'Your request (REQ-2026-7774) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-04 21:58:21'),
(7, 5, 'Certificate Approved! ', 'Great news! Your Barangay Certification (REQ-2026-7774) has been approved and your official e-certificate is ready.', 'success', 0, '2026-10-04 21:58:52'),
(8, 5, 'Certificate Approved! ', 'Great news! Your Barangay Certification (REQ-2026-7774) has been approved and your official e-certificate is ready.', 'success', 0, '2026-10-04 21:58:57'),
(9, 5, 'Request Submitted ', 'Your request (REQ-2026-2644) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-09 08:15:29'),
(10, 7, 'Welcome to ONEcainTAP! ', 'Welcome tite ni regino! You can now easily request Barangay Clearances, Residency certificates, and Indigency documents anytime from home.', 'info', 0, '2026-10-09 08:25:45'),
(11, 7, 'Request Submitted ', 'Your request (REQ-2026-4375) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-09 08:26:30'),
(12, 5, 'Request Submitted ', 'Your request (REQ-2026-7103) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-09 08:31:44'),
(13, 7, 'Request Submitted ', 'Your request (REQ-2026-9117) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-09 09:08:57'),
(14, 7, 'Request Submitted ', 'Your request (REQ-2026-3444) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-09 09:09:30'),
(15, 7, 'Request Submitted ', 'Your request (REQ-2026-6245) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-09 09:10:13'),
(16, 7, 'Request Attention Required ⚠️', 'Your request (REQ-2026-6245) was rejected: \"dawdwa\". Please check details and resubmit.', 'warning', 0, '2026-10-09 09:50:50'),
(17, 7, 'Request Attention Required ⚠️', 'Your request (REQ-2026-3444) was rejected: \"wdasd\". Please check details and resubmit.', 'warning', 0, '2026-10-09 09:50:56'),
(18, 7, 'Request Attention Required ⚠️', 'Your request (REQ-2026-9117) was rejected: \"sadasdawd\". Please check details and resubmit.', 'warning', 0, '2026-10-09 09:51:01'),
(19, 5, 'Certificate Approved! ', 'Great news! Your Barangay Certification (REQ-2026-7103) has been approved and your official e-certificate is ready.', 'success', 0, '2026-10-09 09:51:07'),
(20, 7, 'Certificate Approved! ', 'Great news! Your Barangay Certification (REQ-2026-4375) has been approved and your official e-certificate is ready.', 'success', 0, '2026-10-09 09:51:09'),
(21, 5, 'Certificate Approved! ', 'Great news! Your First Time Jobseeker Certificate (RA 11261) (REQ-2026-2644) has been approved and your official e-certificate is ready.', 'success', 0, '2026-10-09 09:51:11'),
(22, 5, 'Request Submitted ', 'Your request (REQ-2026-2251) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-09 09:56:28'),
(23, 5, 'Certificate Approved! ', 'Great news! Your Barangay Certification (REQ-2026-2251) has been approved and your official e-certificate is ready.', 'success', 0, '2026-10-09 09:57:38'),
(24, 5, 'Request Submitted ', 'Your request (REQ-2026-3239) has been submitted successfully and is queued for barangay verification.', 'info', 0, '2026-10-09 09:59:21'),
(25, 5, 'Certificate Approved! ', 'Great news! Your Barangay Clearance (REQ-2026-3239) has been approved and your official e-certificate is ready.', 'success', 0, '2026-10-09 09:59:41');

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `certificate_id` varchar(50) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `custom_fields` text DEFAULT NULL,
  `delivery_method` enum('pickup','delivery') NOT NULL DEFAULT 'pickup',
  `pickup_date` varchar(50) DEFAULT NULL,
  `pickup_time` varchar(50) DEFAULT NULL,
  `delivery_address` varchar(255) DEFAULT NULL,
  `delivery_contact` varchar(50) DEFAULT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash','gcash','maya') NOT NULL DEFAULT 'cash',
  `payment_status` enum('unpaid','paid','waived') NOT NULL DEFAULT 'unpaid',
  `payment_ref` varchar(100) DEFAULT NULL,
  `id_document_url` varchar(255) DEFAULT NULL,
  `proof_of_residency_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','reviewing','approved','ready','rejected','completed') NOT NULL DEFAULT 'pending',
  `admin_remarks` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `certificate_number` varchar(100) DEFAULT NULL,
  `qr_code_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`id`, `user_id`, `certificate_id`, `purpose`, `custom_fields`, `delivery_method`, `pickup_date`, `pickup_time`, `delivery_address`, `delivery_contact`, `delivery_fee`, `total_amount`, `payment_method`, `payment_status`, `payment_ref`, `id_document_url`, `proof_of_residency_url`, `status`, `admin_remarks`, `approved_by`, `approved_at`, `certificate_number`, `qr_code_hash`, `created_at`, `updated_at`) VALUES
('REQ-2026-2251', 5, 'barangay_certification', 'Scholarship / Educational Requirement', NULL, 'pickup', '2026-10-11', '09:00 AM - 11:00 AM', NULL, NULL, 0.00, 50.00, 'cash', 'unpaid', NULL, '/uploads/file-1791539781441-441201954.jpg', NULL, 'approved', 'tite tite tite tite', 1, '2026-10-09 01:57:38', 'BC-CAIN-2026-8399', 'CAIN-VERIFIED-REQ-2026-2251-1791539858401', '2026-10-09 09:56:28', '2026-10-09 09:57:38'),
('REQ-2026-2644', 5, 'first_time_jobseeker', 'Bank Account Opening / Financial Transaction', NULL, 'delivery', NULL, NULL, 'wwwwwwww', '+63 902318412', 40.00, 40.00, 'gcash', 'paid', 'PAY-729001', '/uploads/file-1791533714609-842466325.pdf', NULL, 'approved', 'wdaad', 1, '2026-10-09 01:51:11', 'BC-CAIN-2026-2699', 'CAIN-VERIFIED-REQ-2026-2644-1791539471687', '2026-10-09 08:15:29', '2026-10-09 09:51:11'),
('REQ-2026-3239', 5, 'barangay_clearance', 'Medical Assistance / DSWD / PCSO', NULL, 'delivery', NULL, NULL, 'wdwadas', '+63 902318412', 0.00, 50.00, 'cash', 'unpaid', NULL, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80', NULL, 'approved', NULL, 1, '2026-10-09 01:59:41', 'BC-CAIN-2026-2038', 'CAIN-VERIFIED-REQ-2026-3239-1791539981389', '2026-10-09 09:59:21', '2026-10-09 09:59:41'),
('REQ-2026-3444', 7, 'barangay_certification', 'Barangay Business Clearance / Mayor\'s Permit', NULL, 'delivery', NULL, NULL, '232313213', '+63 999999999', 0.00, 50.00, 'cash', 'unpaid', NULL, '/uploads/file-1791536960426-879058472.jpg', NULL, 'rejected', 'wdasd', 1, NULL, NULL, NULL, '2026-10-09 09:09:30', '2026-10-09 09:50:56'),
('REQ-2026-4375', 7, 'barangay_certification', 'Barangay Business Clearance / Mayor\'s Permit', NULL, 'pickup', '2026-10-11', '03:00 PM - 05:00 PM', NULL, NULL, 0.00, 50.00, 'gcash', 'paid', 'PAY-390958', '/uploads/file-1791534387130-401923541.jpg', NULL, 'approved', 'sadsad', 1, '2026-10-09 01:51:09', 'BC-CAIN-2026-7589', 'CAIN-VERIFIED-REQ-2026-4375-1791539469932', '2026-10-09 08:26:30', '2026-10-09 09:51:09'),
('REQ-2026-6245', 7, 'barangay_certification', 'Barangay Business Clearance / Mayor\'s Permit', NULL, 'delivery', NULL, NULL, 'waidjwaidjwaidwad', '+63 999999999', 0.00, 50.00, 'cash', 'unpaid', NULL, '/uploads/file-1791537001679-941863934.jpg', NULL, 'rejected', 'dawdwa', 1, NULL, NULL, NULL, '2026-10-09 09:10:13', '2026-10-09 09:50:50'),
('REQ-2026-7103', 5, 'barangay_certification', 'Proof of Residency / Utility Connection', NULL, 'delivery', NULL, NULL, 'tite burat 123', '+63 902318412', 40.00, 90.00, 'gcash', 'paid', 'PAY-704276', '/uploads/file-1791534679682-431135110.png', NULL, 'approved', 'wwww', 1, '2026-10-09 01:51:07', 'BC-CAIN-2026-2155', 'CAIN-VERIFIED-REQ-2026-7103-1791539467063', '2026-10-09 08:31:44', '2026-10-09 09:51:07'),
('REQ-2026-7774', 5, 'barangay_certification', 'Medical Assistance / DSWD / PCSO', NULL, 'pickup', '2026-10-06', '09:00 AM - 11:00 AM', NULL, NULL, 0.00, 50.00, 'cash', 'unpaid', NULL, '/uploads/file-1791151093793-165904105.png', NULL, 'approved', NULL, 1, '2026-10-04 13:58:57', 'BC-CAIN-2026-4240', 'CAIN-VERIFIED-REQ-2026-7774-1791151137460', '2026-10-04 21:58:21', '2026-10-04 21:58:57'),
('REQ-2026-9117', 7, 'barangay_certification', 'Scholarship / Educational Requirement', NULL, 'delivery', NULL, NULL, '12341234', '+63 999999999', 0.00, 50.00, 'cash', 'unpaid', NULL, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80', NULL, 'rejected', 'sadasdawd', 1, NULL, NULL, NULL, '2026-10-09 09:08:57', '2026-10-09 09:51:01');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(50) NOT NULL,
  `request_id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_status` varchar(50) NOT NULL,
  `or_number` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `contact_number` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `barangay` varchar(100) NOT NULL DEFAULT 'San Roque',
  `role` enum('resident','admin','staff') NOT NULL DEFAULT 'resident',
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `contact_number`, `address`, `barangay`, `role`, `avatar`, `created_at`) VALUES
(1, 'Nieto', 'admin@cainta.gov.ph', 'admin123', '+63 917 888 1234', 'Cainta Municipal Hall, Cainta, Rizal', 'San Roque', 'admin', NULL, '2026-10-04 20:58:59'),
(5, 'Jade Mamaril', 'mamariljerick1426@gmail.com', '0909jekjek', '+63 902318412', 'tite burat 123', 'San Isidro', 'resident', NULL, '2026-10-04 21:00:21'),
(7, 'tite ni regino', 'burat123@gmail.com', '123123', '+63 999999999', '12341234', 'San Juan', 'resident', NULL, '2026-10-09 08:25:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `certificates_catalog`
--
ALTER TABLE `certificates_catalog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `certificate_id` (`certificate_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`certificate_id`) REFERENCES `certificates_catalog` (`id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
