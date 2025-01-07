CREATE TABLE `edusync_db`.`lecture` (
  `lecture_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `mobile` VARCHAR(13) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(200) NULL,
  `create_at` INT NOT NULL,
  PRIMARY KEY (`lecture_id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) ,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) ,
  INDEX `fk_lecture_create_idx` (`create_at` ASC) ,
  CONSTRAINT `fk_lecture_create`
    FOREIGN KEY (`create_at`)
    REFERENCES `edusync_db`.`admin` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);



-- Create the `program` table
CREATE TABLE `edusync_db`.`program` (
  `program_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` VARCHAR(1000) NULL,
  `duration` VARCHAR(45) NOT NULL,
  `create_at` INT NOT NULL,
  PRIMARY KEY (`program_id`),
  UNIQUE INDEX `title_UNIQUE` (`title` ASC),
  INDEX `fk_program_create_at_idx` (`create_at` ASC),
  CONSTRAINT `fk_program_create_at`
    FOREIGN KEY (`create_at`)
    REFERENCES `edusync_db`.`admin` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Insert 10 records into the `program` table
INSERT INTO `edusync_db`.`program` (`title`, `description`, `duration`, `create_at`)
VALUES 
  ('Bachelor of Computer Science', 'A comprehensive program focusing on computer science fundamentals.', '4 Years', 1),
  ('Diploma in Information Technology', 'An introductory program to IT concepts and applications.', '1 Year', 1),
  ('Bachelor of Business Administration', 'A program designed for future business leaders.', '3 Years', 1),
  ('Diploma in Graphic Design', 'A creative program for aspiring graphic designers.', '6 Months', 1),
  ('Master of Data Science', 'An advanced program on data analysis and machine learning.', '2 Years', 1),
  ('Diploma in Web Development', 'A program to learn website development technologies.', '1 Year', 1),
  ('Bachelor of Mechanical Engineering', 'A program covering mechanical engineering principles.', '4 Years', 1),
  ('Diploma in Digital Marketing', 'A program to master online marketing strategies.', '6 Months', 1),
  ('Bachelor of Psychology', 'A program exploring human behavior and mental processes.', '3 Years', 1),
  ('Diploma in Culinary Arts', 'A program for aspiring chefs and culinary experts.', '1 Year', 1);


-- batch

CREATE TABLE `edusync_db`.`batch` (
  `batch_id` INT NOT NULL AUTO_INCREMENT,
  `program_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `managed_by` INT NOT NULL,
  PRIMARY KEY (`batch_id`),
  INDEX `fk_batch_manage_by_idx` (`managed_by` ASC) ,
  CONSTRAINT `fk_batch_manage_by`
    FOREIGN KEY (`managed_by`)
    REFERENCES `edusync_db`.`admin` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

-- Insert 15 records into the `batch` table
INSERT INTO `edusync_db`.`batch` (`program_id`, `start_date`, `managed_by`)
VALUES 
  (1, '2025-01-01', 1),
  (2, '2025-01-15', 1),
  (3, '2025-02-01', 1),
  (4, '2025-02-15', 1),
  (5, '2025-03-01', 1),
  (6, '2025-03-15', 1),
  (7, '2025-04-01', 1),
  (8, '2025-04-15', 1),
  (9, '2025-05-01', 1),
  (10, '2025-05-15', 1),
  (1, '2025-06-01', 1),
  (2, '2025-06-15', 1),
  (3, '2025-07-01', 1),
  (4, '2025-07-15', 1),
  (5, '2025-08-01', 1);



CREATE TABLE `edusync_db`.`student` (
  `student_id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(200) NOT NULL,
  `first_name` VARCHAR(200) NOT NULL,
  `last_name` VARCHAR(200) NOT NULL,
  `mobile` VARCHAR(12) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `batch_id` INT NOT NULL,
  `managed_by` INT NOT NULL,
  PRIMARY KEY (`student_id`, `email`),
  INDEX `fk_batch_id_idx` (`batch_id` ASC) VISIBLE,
  INDEX `fk_managed_by_idx` (`managed_by` ASC) VISIBLE,
  CONSTRAINT `fk_batch_id`
    FOREIGN KEY (`batch_id`)
    REFERENCES `edusync_db`.`batch` (`batch_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_managed_by`
    FOREIGN KEY (`managed_by`)
    REFERENCES `edusync_db`.`admin` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
DROP TRIGGER IF EXISTS `edusync_db`.`student_BEFORE_INSERT`;

DELIMITER $$
USE `edusync_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `edusync_db`.`student_BEFORE_INSERT` BEFORE INSERT ON `student` FOR EACH ROW
BEGIN
	DECLARE program_char VARCHAR(45);
    DECLARE batch_count INT;
    
    SELECT p.program_characters
    INTO program_char
    FROM `edusync_db`.`batch` b
    JOIN `edusync_db`.`program` p ON b.program_id = p.program_id
    WHERE b.batch_id = NEW.batch_id;

    -- Calculate the current student count in the batch
    SELECT COUNT(*)
    INTO batch_count
    FROM `edusync_db`.`student`
    WHERE batch_id = NEW.batch_id;

    -- Generate the username
    SET NEW.username = CONCAT(program_char, LPAD(batch_count + 1, 4, '0'));
END$$
DELIMITER ;



CREATE TABLE `edusync_db`.`module` (
  `module_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `module_char` VARCHAR(45) NOT NULL,
  `sessions` INT NOT NULL,
  PRIMARY KEY (`module_id`));

CREATE TABLE `edusync_db`.`program_module` (
  `program_id` INT NOT NULL,
  `module_id` INT NULL,
  PRIMARY KEY (`program_id`),
  INDEX `fk_program_module_id_idx` (`module_id` ASC) ,
  CONSTRAINT `fk_module_program_id`
    FOREIGN KEY (`program_id`)
    REFERENCES `edusync_db`.`program` (`program_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_program_module_id`
    FOREIGN KEY (`module_id`)
    REFERENCES `edusync_db`.`module` (`module_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);


INSERT INTO `edusync_db`.`module` (`module_id`, `title`, `module_char`, `sessions`)
VALUES
(1, 'Introduction to Programming', 'PRG', 10),
(2, 'Data Structures', 'DS', 12),
(3, 'Database Systems', 'DB', 15),
(4, 'Web Development', 'WEB', 14),
(5, 'Software Engineering', 'SWE', 16),
(6, 'Computer Networks', 'CN', 12),
(7, 'Artificial Intelligence', 'AI', 18),
(8, 'Operating Systems', 'OS', 12),
(9, 'Cybersecurity Basics', 'CYB', 10),
(10, 'Machine Learning', 'ML', 20),
(11, 'Cloud Computing', 'CC', 15),
(12, 'Big Data Analytics', 'BDA', 18),
(13, 'Mobile Application Development', 'MAD', 16),
(14, 'Blockchain Technology', 'BCT', 15),
(15, 'IoT Fundamentals', 'IoT', 12),
(16, 'Game Development', 'GD', 20),
(17, 'Network Security', 'NS', 14),
(18, 'Digital Marketing', 'DM', 10),
(19, 'DevOps Essentials', 'DO', 15),
(20, 'Agile Project Management', 'APM', 12),
(21, 'UX/UI Design', 'UX', 14),
(22, 'Ethical Hacking', 'EH', 18),
(23, 'Embedded Systems', 'ES', 16),
(24, 'Advanced Python', 'PY', 12),
(25, 'Java Programming', 'JP', 20),
(26, 'C++ Programming', 'CPP', 15),
(27, 'R Programming', 'RP', 10),
(28, 'System Analysis and Design', 'SAD', 14),
(29, 'Digital Transformation', 'DT', 18),
(30, 'Robotics Basics', 'RB', 16),
(31, 'Natural Language Processing', 'NLP', 20),
(32, 'Quantum Computing', 'QC', 12),
(33, 'Virtual Reality', 'VR', 18),
(34, 'Augmented Reality', 'AR', 18),
(35, 'Compiler Design', 'CD', 15),
(36, 'Distributed Systems', 'DSY', 14),
(37, 'Network Administration', 'NA', 16),
(38, 'Information Retrieval', 'IR', 12),
(39, 'Human-Computer Interaction', 'HCI', 14),
(40, 'Bioinformatics', 'BIO', 15),
(41, 'Digital Forensics', 'DF', 10),
(42, 'Software Testing', 'ST', 14),
(43, 'Cyber Law and Ethics', 'CLE', 12),
(44, 'Introduction to AI', 'IAI', 16),
(45, 'Advanced Database Systems', 'ADB', 18),
(46, 'Parallel Computing', 'PC', 14),
(47, 'Image Processing', 'IP', 12),
(48, 'Advanced Java', 'AJ', 20),
(49, 'PHP and MySQL', 'PHP', 15),
(50, 'Ruby on Rails', 'ROR', 16);


INSERT INTO `edusync_db`.`program_module` (`program_id`, `module_id`)
VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18), (2, 19), (2, 20),
(3, 21), (3, 22), (3, 23), (3, 24), (3, 25), (3, 26), (3, 27), (3, 28), (3, 29), (3, 30),
(4, 31), (4, 32), (4, 33), (4, 34), (4, 35), (4, 36), (4, 37), (4, 38), (4, 39), (4, 40),
(5, 41), (5, 42), (5, 43), (5, 44), (5, 45), (5, 46), (5, 47), (5, 48), (5, 49), (5, 50);




CREATE TABLE edusync_db.module_assign (
  module_assign_id INT NOT NULL AUTO_INCREMENT,
  batch_id INT NOT NULL,
  module_id INT NOT NULL,
  lecture_id INT NOT NULL,
  PRIMARY KEY (module_assign_id),
  INDEX fk_assign_module_idx (module_id ASC) ,
  INDEX fk_assign_batch_idx (batch_id ASC) ,
  INDEX fk_assign_lecture_idx (lecture_id ASC) ,
  CONSTRAINT fk_assign_module
    FOREIGN KEY (module_id)
    REFERENCES edusync_db.module (module_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_assign_batch
    FOREIGN KEY (batch_id)
    REFERENCES edusync_db.batch (batch_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_assign_lecture
    FOREIGN KEY (lecture_id)
    REFERENCES edusync_db.lecture (lecture_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

  
  INSERT INTO `edusync_db`.`module_assign` (`batch_id`, `module_id`, `lecture_id`)
VALUES
(1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4), (1, 5, 5), (1, 6, 6), (1, 7, 7), (1, 8, 8), (1, 9, 9), (1, 10, 10),
(2, 1, 1), (2, 2, 2), (2, 3, 3), (2, 4, 4), (2, 5, 5), (2, 6, 6), (2, 7, 7), (2, 8, 8), (2, 9, 9), (2, 10, 10),
(3, 1, 1), (3, 2, 2), (3, 3, 3), (3, 4, 4), (3, 5, 5), (3, 6, 6), (3, 7, 7), (3, 8, 8), (3, 9, 9), (3, 10, 10),
(4, 1, 1), (4, 2, 2), (4, 3, 3), (4, 4, 4), (4, 5, 5), (4, 6, 6), (4, 7, 7), (4, 8, 8), (4, 9, 9), (4, 10, 10),
(5, 1, 1), (5, 2, 2), (5, 3, 3), (5, 4, 4), (5, 5, 5), (5, 6, 6), (5, 7, 7), (5, 8, 8), (5, 9, 9), (5, 10, 10),
(6, 1, 1), (6, 2, 2), (6, 3, 3), (6, 4, 4), (6, 5, 5), (6, 6, 6), (6, 7, 7), (6, 8, 8), (6, 9, 9), (6, 10, 10),
(7, 1, 1), (7, 2, 2), (7, 3, 3), (7, 4, 4), (7, 5, 5), (7, 6, 6), (7, 7, 7), (7, 8, 8), (7, 9, 9), (7, 10, 10),
(8, 1, 1), (8, 2, 2), (8, 3, 3), (8, 4, 4), (8, 5, 5), (8, 6, 6), (8, 7, 7), (8, 8, 8), (8, 9, 9), (8, 10, 10),
(9, 1, 1), (9, 2, 2), (9, 3, 3), (9, 4, 4), (9, 5, 5), (9, 6, 6), (9, 7, 7), (9, 8, 8), (9, 9, 9), (9, 10, 10),
(10, 1, 1), (10, 2, 2), (10, 3, 3), (10, 4, 4), (10, 5, 5), (10, 6, 6), (10, 7, 7), (10, 8, 8), (10, 9, 9), (10, 10, 10);




CREATE TABLE `edusync_db`.`assigment` (
  `assigment_id` INT NOT NULL AUTO_INCREMENT,
  `module_assign_id` INT NOT NULL,
  `assigment_type` ENUM('courcework', 'practical', 'exam', 'written', 'Presentation', 'group') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `marks` INT NOT NULL,
  `resource` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`assigment_id`, `module_assign_id`),
  INDEX `fk_assgmrny_module_data_idx` (`module_assign_id` ASC),
  CONSTRAINT `fk_assgmrny_module_data`
    FOREIGN KEY (`module_assign_id`)
    REFERENCES `edusync_db`.`module_assign` (`module_assign_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);


INSERT INTO `edusync_db`.`assigment` 
(`module_assign_id`, `assigment_type`, `start_date`, `end_date`, `marks`, `resource`) 
VALUES
(1, 'courcework', '2025-01-01', '2025-01-15', 100, 'resource_1.pdf'),
(2, 'practical', '2025-01-02', '2025-01-16', 80, 'resource_2.pdf'),
(3, 'exam', '2025-01-03', '2025-01-17', 90, 'resource_3.pdf'),
(4, 'written', '2025-01-04', '2025-01-18', 70, 'resource_4.pdf'),
(5, 'Presentation', '2025-01-05', '2025-01-19', 95, 'resource_5.pdf'),
(6, 'group', '2025-01-06', '2025-01-20', 85, 'resource_6.pdf'),
(7, 'courcework', '2025-01-07', '2025-01-21', 88, 'resource_7.pdf'),
(8, 'practical', '2025-01-08', '2025-01-22', 92, 'resource_8.pdf'),
(9, 'exam', '2025-01-09', '2025-01-23', 76, 'resource_9.pdf'),
(10, 'written', '2025-01-10', '2025-01-24', 89, 'resource_10.pdf'),
(11, 'Presentation', '2025-01-11', '2025-01-25', 94, 'resource_11.pdf'),
(12, 'group', '2025-01-12', '2025-01-26', 81, 'resource_12.pdf'),
(13, 'courcework', '2025-01-13', '2025-01-27', 77, 'resource_13.pdf'),
(14, 'practical', '2025-01-14', '2025-01-28', 96, 'resource_14.pdf'),
(15, 'exam', '2025-01-15', '2025-01-29', 91, 'resource_15.pdf'),
(16, 'written', '2025-01-16', '2025-01-30', 79, 'resource_16.pdf'),
(17, 'Presentation', '2025-01-17', '2025-01-31', 98, 'resource_17.pdf'),
(18, 'group', '2025-01-18', '2025-02-01', 83, 'resource_18.pdf'),
(19, 'courcework', '2025-01-19', '2025-02-02', 84, 'resource_19.pdf'),
(20, 'practical', '2025-01-20', '2025-02-03', 82, 'resource_20.pdf'),
(21, 'exam', '2025-01-21', '2025-02-04', 93, 'resource_21.pdf'),
(22, 'written', '2025-01-22', '2025-02-05', 78, 'resource_22.pdf'),
(23, 'Presentation', '2025-01-23', '2025-02-06', 86, 'resource_23.pdf'),
(24, 'group', '2025-01-24', '2025-02-07', 87, 'resource_24.pdf'),
(25, 'courcework', '2025-01-25', '2025-02-08', 97, 'resource_25.pdf'),
(26, 'practical', '2025-01-26', '2025-02-09', 88, 'resource_26.pdf'),
(27, 'exam', '2025-01-27', '2025-02-10', 92, 'resource_27.pdf'),
(28, 'written', '2025-01-28', '2025-02-11', 81, 'resource_28.pdf'),
(29, 'Presentation', '2025-01-29', '2025-02-12', 85, 'resource_29.pdf'),
(30, 'group', '2025-01-30', '2025-02-13', 90, 'resource_30.pdf');


-- Insert Assignment records for 50 module_assign_ids with different types and marks distributions starting from 101

INSERT INTO `edusync_db`.`assigment` (`module_assign_id`, `assigment_type`, `start_date`, `end_date`, `marks`, `resource`) VALUES
(101, 'exam', '2025-01-01', '2025-01-10', 100, 'resource_exam.pdf'),
(102, 'courcework', '2025-01-01', '2025-01-05', 50, 'resource_courcework.pdf'),
(103, 'practical', '2025-01-06', '2025-01-10', 50, 'resource_practical.pdf'),
(104, 'written', '2025-02-01', '2025-02-05', 40, 'resource_written.pdf'),
(105, 'presentation', '2025-02-06', '2025-02-10', 60, 'resource_presentation.pdf'),
(106, 'courcework', '2025-03-01', '2025-03-05', 50, 'resource_courcework.pdf'),
(107, 'practical', '2025-03-06', '2025-03-10', 50, 'resource_practical.pdf'),
(108, 'exam', '2025-04-01', '2025-04-10', 100, 'resource_exam.pdf'),
(109, 'courcework', '2025-05-01', '2025-05-05', 50, 'resource_courcework.pdf'),
(110, 'practical', '2025-05-06', '2025-05-10', 50, 'resource_practical.pdf'),
(111, 'written', '2025-06-01', '2025-06-05', 40, 'resource_written.pdf'),
(112, 'presentation', '2025-06-06', '2025-06-10', 60, 'resource_presentation.pdf'),
(113, 'exam', '2025-07-01', '2025-07-10', 100, 'resource_exam.pdf'),
(114, 'courcework', '2025-08-01', '2025-08-05', 50, 'resource_courcework.pdf'),
(115, 'practical', '2025-08-06', '2025-08-10', 50, 'resource_practical.pdf'),
(116, 'written', '2025-09-01', '2025-09-05', 40, 'resource_written.pdf'),
(117, 'presentation', '2025-09-06', '2025-09-10', 60, 'resource_presentation.pdf'),
(118, 'exam', '2025-10-01', '2025-10-10', 100, 'resource_exam.pdf'),
(119, 'courcework', '2025-11-01', '2025-11-05', 50, 'resource_courcework.pdf'),
(120, 'practical', '2025-11-06', '2025-11-10', 50, 'resource_practical.pdf'),
(121, 'written', '2025-12-01', '2025-12-05', 40, 'resource_written.pdf'),
(122, 'presentation', '2025-12-06', '2025-12-10', 60, 'resource_presentation.pdf'),
(123, 'exam', '2025-01-01', '2025-01-10', 100, 'resource_exam.pdf'),
(124, 'courcework', '2025-02-01', '2025-02-05', 50, 'resource_courcework.pdf'),
(125, 'practical', '2025-02-06', '2025-02-10', 50, 'resource_practical.pdf'),
(126, 'written', '2025-03-01', '2025-03-05', 40, 'resource_written.pdf'),
(127, 'presentation', '2025-03-06', '2025-03-10', 60, 'resource_presentation.pdf'),
(128, 'exam', '2025-04-01', '2025-04-10', 100, 'resource_exam.pdf'),
(129, 'courcework', '2025-05-01', '2025-05-05', 50, 'resource_courcework.pdf'),
(130, 'practical', '2025-05-06', '2025-05-10', 50, 'resource_practical.pdf'),
(131, 'written', '2025-06-01', '2025-06-05', 40, 'resource_written.pdf'),
(132, 'presentation', '2025-06-06', '2025-06-10', 60, 'resource_presentation.pdf'),
(133, 'exam', '2025-07-01', '2025-07-10', 100, 'resource_exam.pdf'),
(134, 'courcework', '2025-08-01', '2025-08-05', 50, 'resource_courcework.pdf'),
(135, 'practical', '2025-08-06', '2025-08-10', 50, 'resource_practical.pdf'),
(136, 'written', '2025-09-01', '2025-09-05', 40, 'resource_written.pdf'),
(137, 'presentation', '2025-09-06', '2025-09-10', 60, 'resource_presentation.pdf'),
(138, 'exam', '2025-10-01', '2025-10-10', 100, 'resource_exam.pdf'),
(139, 'courcework', '2025-11-01', '2025-11-05', 50, 'resource_courcework.pdf'),
(140, 'practical', '2025-11-06', '2025-11-10', 50, 'resource_practical.pdf'),
(141, 'written', '2025-12-01', '2025-12-05', 40, 'resource_written.pdf'),
(142, 'presentation', '2025-12-06', '2025-12-10', 60, 'resource_presentation.pdf'),
(143, 'exam', '2025-01-01', '2025-01-10', 100, 'resource_exam.pdf'),
(144, 'courcework', '2025-02-01', '2025-02-05', 50, 'resource_courcework.pdf'),
(145, 'practical', '2025-02-06', '2025-02-10', 50, 'resource_practical.pdf'),
(146, 'written', '2025-03-01', '2025-03-05', 40, 'resource_written.pdf'),
(147, 'presentation', '2025-03-06', '2025-03-10', 60, 'resource_presentation.pdf'),
(148, 'exam', '2025-04-01', '2025-04-10', 100, 'resource_exam.pdf'),
(149, 'courcework', '2025-05-01', '2025-05-05', 50, 'resource_courcework.pdf'),
(150, 'practical', '2025-05-06', '2025-05-10', 50, 'resource_practical.pdf');




CREATE TABLE `edusync_db`.`assigment_submission` (
  `submission_id` INT NOT NULL AUTO_INCREMENT,
  `assigment_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `submission_date` DATETIME NOT NULL,
  `status` ENUM('submitted', 'not-submitted', 'repeat'),
  `marks_obtain` INT NULL,
  `file` VARCHAR(200) NULL,
  `remarks` VARCHAR(200) NULL,
  PRIMARY KEY (`submission_id`),
  INDEX `fk_assigment_assigment_id_idx` (`assigment_id` ASC),
  INDEX `fk_submit_student_idx` (`student_id` ASC),
  CONSTRAINT `fk_assigment_assigment_id`
    FOREIGN KEY (`assigment_id`)
    REFERENCES `edusync_db`.`assigment` (`assigment_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_submit_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `edusync_db`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO `edusync_db`.`assigment_submission` (`assigment_id`, `student_id`, `submission_date`, `status`, `marks_obtain`, `file`, `remarks`)
VALUES
  (1, 1, NOW(), 'submitted', 85, 'file_1.pdf', 'Good work'),
  (1, 2, NOW(), 'submitted', 90, 'file_2.pdf', 'Excellent work'),
  (1, 3, NOW(), 'not-submitted', NULL, NULL, 'Did not submit'),
  (1, 4, NOW(), 'submitted', 75, 'file_4.pdf', 'Needs improvement'),
  (1, 5, NOW(), 'repeat', NULL, NULL, 'Repeat submission'),
  (1, 6, NOW(), 'submitted', 95, 'file_6.pdf', 'Outstanding'),
  (1, 7, NOW(), 'submitted', 70, 'file_7.pdf', 'Needs improvement'),
  (1, 8, NOW(), 'not-submitted', NULL, NULL, 'Did not submit'),
  (1, 9, NOW(), 'submitted', 80, 'file_9.pdf', 'Good submission'),
  (1, 10, NOW(), 'submitted', 88, 'file_10.pdf', 'Well done'),
  (1, 11, NOW(), 'repeat', NULL, NULL, 'Repeat submission'),
  (1, 12, NOW(), 'submitted', 92, 'file_12.pdf', 'Excellent submission'),
  (1, 13, NOW(), 'submitted', 84, 'file_13.pdf', 'Good effort'),
  (1, 14, NOW(), 'not-submitted', NULL, NULL, 'Did not submit'),
  (1, 15, NOW(), 'submitted', 78, 'file_15.pdf', 'Needs improvement'),
  (1, 16, NOW(), 'repeat', NULL, NULL, 'Repeat submission'),
  (1, 17, NOW(), 'submitted', 90, 'file_17.pdf', 'Great submission'),
  (1, 18, NOW(), 'submitted', 82, 'file_18.pdf', 'Satisfactory'),
  (1, 19, NOW(), 'not-submitted', NULL, NULL, 'Did not submit'),
  (1, 20, NOW(), 'submitted', 87, 'file_20.pdf', 'Well done');







CREATE TABLE `edusync_db`.`session` (
  `session_id` INT NOT NULL AUTO_INCREMENT,
  `module_asign_id` INT NOT NULL,
  `session_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`session_id`),
  INDEX `fk_module_assign_idx` (`module_asign_id` ASC) ,
  CONSTRAINT `fk_module_assign`
    FOREIGN KEY (`module_asign_id`)
    REFERENCES `edusync_db`.`module_assign` (`module_assign_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

INSERT INTO `edusync_db`.`session` (`module_asign_id`, `session_name`) VALUES
(101, 'Session 1'),
(101, 'Session 2'),
(102, 'Session 3'),
(102, 'Session 4'),
(103, 'Session 5'),
(103, 'Session 6'),
(104, 'Session 7'),
(104, 'Session 8'),
(105, 'Session 9'),
(105, 'Session 10'),
(106, 'Session 11'),
(106, 'Session 12'),
(107, 'Session 13'),
(107, 'Session 14'),
(108, 'Session 15'),
(108, 'Session 16'),
(109, 'Session 17'),
(109, 'Session 18'),
(110, 'Session 19'),
(110, 'Session 20');


CREATE TABLE `edusync_db`.`hall` (
  `hall_id` VARCHAR(10) NOT NULL,
  `type` ENUM('lab', 'classroom', 'hall') NOT NULL,
  PRIMARY KEY (`hall_id`));


INSERT INTO `edusync_db`.`hall` (`hall_id`, `type`) VALUES
('S11', 'classroom'),
('S12', 'classroom'),
('S21', 'lab'),
('S22', 'lab'),
('S31', 'hall'),
('S32', 'hall'),
('N11', 'classroom'),
('N12', 'classroom'),
('N21', 'lab'),
('N22', 'lab'),
('N31', 'hall'),
('N32', 'hall'),
('S13', 'classroom'),
('S14', 'classroom'),
('S23', 'lab'),
('S24', 'lab'),
('S33', 'hall'),
('S34', 'hall'),
('N13', 'classroom'),
('N14', 'classroom'),
('N23', 'lab'),
('N24', 'lab'),
('N33', 'hall'),
('N34', 'hall'),
('S15', 'classroom'),
('S16', 'classroom'),
('S25', 'lab'),
('S26', 'lab'),
('S35', 'hall'),
('S36', 'hall'),
('N15', 'classroom'),
('N16', 'classroom'),
('N25', 'lab'),
('N26', 'lab'),
('N35', 'hall'),
('N36', 'hall'),
('S17', 'classroom'),
('S18', 'classroom'),
('S27', 'lab'),
('S28', 'lab');


CREATE TABLE edusync_db.shedule (
  shedule_id INT NOT NULL AUTO_INCREMENT,
  session_id INT NOT NULL,
  shedule_date DATETIME NOT NULL,
  star_time TIME NOT NULL,
  end_time TIME NULL,
  hall_id VARCHAR(45) NOT NULL,
  PRIMARY KEY (shedule_id, session_id),
  INDEX fk_shedule_session_idx (session_id ASC) ,
  INDEX fk_shefule_hall_idx (hall_id ASC) ,
  CONSTRAINT fk_shedule_session
    FOREIGN KEY (session_id)
    REFERENCES edusync_db.session (session_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_shefule_hall
    FOREIGN KEY (hall_id)
    REFERENCES edusync_db.hall (hall_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);


  INSERT INTO `edusync_db`.`shedule` (`session_id`, `shedule_date`, `star_time`, `end_time`, `hall_id`) VALUES
(1, '2025-01-10 08:00:00', '08:00:00', '10:00:00', 'S11'),
(2, '2025-01-10 10:30:00', '10:30:00', '12:30:00', 'S12'),
(3, '2025-01-10 14:00:00', '14:00:00', '16:00:00', 'S13'),
(4, '2025-01-11 08:00:00', '08:00:00', '10:00:00', 'S14'),
(5, '2025-01-11 10:30:00', '10:30:00', '12:30:00', 'S15'),
(6, '2025-01-11 14:00:00', '14:00:00', '16:00:00', 'S16'),
(7, '2025-01-12 08:00:00', '08:00:00', '10:00:00', 'S17'),
(8, '2025-01-12 10:30:00', '10:30:00', '12:30:00', 'S18'),
(9, '2025-01-12 14:00:00', '14:00:00', '16:00:00', 'S19'),
(10, '2025-01-13 08:00:00', '08:00:00', '10:00:00', 'S20'),
(11, '2025-01-13 10:30:00', '10:30:00', '12:30:00', 'S21'),
(12, '2025-01-13 14:00:00', '14:00:00', '16:00:00', 'S22'),
(13, '2025-01-14 08:00:00', '08:00:00', '10:00:00', 'S23'),
(14, '2025-01-14 10:30:00', '10:30:00', '12:30:00', 'S24'),
(15, '2025-01-14 14:00:00', '14:00:00', '16:00:00', 'S25'),
(16, '2025-01-15 08:00:00', '08:00:00', '10:00:00', 'S26'),
(17, '2025-01-15 10:30:00', '10:30:00', '12:30:00', 'S27'),
(18, '2025-01-15 14:00:00', '14:00:00', '16:00:00', 'S28'),
(19, '2025-01-16 08:00:00', '08:00:00', '10:00:00', 'S29'),
(20, '2025-01-16 10:30:00', '10:30:00', '12:30:00', 'S30');

CREATE TABLE `edusync_db`.`student_attendance` (
  `student_id` INT NOT NULL,
  `session_id` INT NOT NULL,
  `marks_as` ENUM('qr', 'manual') NOT NULL,
  `mark_date_time` DATETIME NOT NULL,
  `remarks` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`student_id`, `session_id`),
  INDEX `fk_attendance_session_idx` (`session_id` ASC),
  CONSTRAINT `fk_attendance_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `edusync_db`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_session`
    FOREIGN KEY (`session_id`)
    REFERENCES `edusync_db`.`session` (`session_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);




CREATE TABLE `edusync_db`.`quiz_submission` (
  `submission_id` INT NOT NULL AUTO_INCREMENT,
  `session_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `mark_obtained` INT NOT NULL,
  PRIMARY KEY (`submission_id`),
  INDEX `fk_quiz_session_idx` (`session_id` ASC) ,
  INDEX `fk_quiz_student_idx` (`student_id` ASC) ,
  CONSTRAINT `fk_quiz_session`
    FOREIGN KEY (`session_id`)
    REFERENCES `edusync_db`.`session` (`session_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_quiz_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `edusync_db`.`student` (`student_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
