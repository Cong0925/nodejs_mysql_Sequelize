/*
 Navicat Premium Data Transfer

 Source Server         : 8.140.241.248
 Source Server Type    : MySQL
 Source Server Version : 80035
 Source Host           : 8.140.241.248:13306
 Source Schema         : sportsmeet

 Target Server Type    : MySQL
 Target Server Version : 80035
 File Encoding         : 65001

 Date: 15/05/2024 20:12:08
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`  (
  `admin_id` bigint NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `user_id` bigint NULL DEFAULT NULL,
  `college_id` bigint NOT NULL COMMENT '学院ID',
  `admin_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '用户名',
  `phone` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`admin_id`, `college_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '账号信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for class
-- ----------------------------
DROP TABLE IF EXISTS `class`;
CREATE TABLE `class`  (
  `class_id` bigint NOT NULL COMMENT '班级ID',
  `class_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '班级名称',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`class_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '班级表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for college
-- ----------------------------
DROP TABLE IF EXISTS `college`;
CREATE TABLE `college`  (
  `college_id` bigint NOT NULL COMMENT '学院ID',
  `college_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '学院名称',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`college_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '学院信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for games
-- ----------------------------
DROP TABLE IF EXISTS `games`;
CREATE TABLE `games`  (
  `game_id` bigint NOT NULL COMMENT '比赛ID',
  `project_id` bigint NOT NULL COMMENT '所属项目ID',
  `sports_id` bigint NOT NULL COMMENT '运动会ID',
  `game_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '比赛名称',
  `game_time` datetime NULL DEFAULT NULL COMMENT '比赛时间',
  `location_id` bigint NULL DEFAULT NULL COMMENT '比赛场地ID',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`game_id`) USING BTREE,
  INDEX `location_id`(`location_id` ASC) USING BTREE,
  INDEX `project_id`(`project_id` ASC) USING BTREE,
  INDEX `sports_id`(`sports_id` ASC) USING BTREE,
  CONSTRAINT `games_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `games_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `games_ibfk_3` FOREIGN KEY (`sports_id`) REFERENCES `sports` (`sports_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '比赛信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for location
-- ----------------------------
DROP TABLE IF EXISTS `location`;
CREATE TABLE `location`  (
  `location_id` bigint NOT NULL COMMENT '场地ID',
  `location_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '场地名称',
  `location_introduce` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '场地介绍',
  `location_place` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '场地位置',
  `location_kind` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '场地类别：1室内2室外',
  `location_admin` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '场地管理员姓名',
  `location_admin_tel` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '场地管理员电话',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`location_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '比赛场地表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for news
-- ----------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news`  (
  `news_id` bigint NOT NULL COMMENT '新闻ID',
  `title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '新闻标题',
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL COMMENT '新闻内容',
  `college_id` bigint NULL DEFAULT NULL COMMENT '学院编号',
  `news_picture` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '新闻图片',
  `reporter` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '作者',
  `admin_id` int NULL DEFAULT NULL COMMENT '添加者',
  `state` tinyint NULL DEFAULT NULL COMMENT '新闻状态:0--待审核，1--审核通过；2--推荐',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`news_id`) USING BTREE,
  INDEX `college_id1`(`college_id` ASC) USING BTREE,
  CONSTRAINT `news_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `college` (`college_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '新闻报道' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project`  (
  `project_id` bigint NOT NULL COMMENT '项目ID',
  `project_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '项目名称',
  `project_introduce` varchar(2000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '项目及比赛规则介绍',
  `project_group` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '项目组别：1-学生组；2--教工组; 3-师生组',
  `project_sex` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '性别要求',
  `category` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '项目类别:1--田赛；2--径赛；3-其它',
  `project_num` int NULL DEFAULT NULL COMMENT '运动员人数',
  `referee_num` int NULL DEFAULT NULL COMMENT '所需裁判人数',
  `volunteer_num` int NULL DEFAULT NULL COMMENT '所需志愿者人数',
  `unit` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '计量单位：秒，米',
  `best_record` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '历史最好成绩',
  `best_athlete` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '最好纪录保持者',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`project_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '运动项目表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for referee
-- ----------------------------
DROP TABLE IF EXISTS `referee`;
CREATE TABLE `referee`  (
  `referee_id` bigint NOT NULL COMMENT '裁判ID',
  `referee_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '裁判姓名',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户id',
  `personal_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '教职工号/学号',
  `user_type` tinyint NULL DEFAULT NULL COMMENT '1.教职工 0.学生',
  `college_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '学院ID',
  `phone` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '裁判手机号',
  `e_mail` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '裁判邮箱',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1.删除 0.保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`referee_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '裁判表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for referee_game
-- ----------------------------
DROP TABLE IF EXISTS `referee_game`;
CREATE TABLE `referee_game`  (
  `referee_id` bigint NOT NULL COMMENT '裁判id',
  `game_id` bigint NOT NULL COMMENT '比赛id',
  `sports_id` bigint NOT NULL COMMENT '运动会ID',
  `referee_type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '裁判类型：主裁；',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`referee_id`, `game_id`, `sports_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '比赛裁判信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for show
-- ----------------------------
DROP TABLE IF EXISTS `show`;
CREATE TABLE `show`  (
  `show_id` bigint NOT NULL COMMENT '风采展示编号',
  `show_title` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '风采标题',
  `show_content` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '风采内容',
  `college_id` bigint NULL DEFAULT NULL COMMENT '学院ID',
  `report_picture` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '风采图片',
  `state` tinyint NULL DEFAULT NULL COMMENT '状态',
  `admin_id` bigint NOT NULL COMMENT '添加人',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`show_id`, `admin_id`) USING BTREE,
  INDEX `college_id2`(`college_id` ASC) USING BTREE,
  CONSTRAINT `show_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `college` (`college_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '风采展示' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sports
-- ----------------------------
DROP TABLE IF EXISTS `sports`;
CREATE TABLE `sports`  (
  `sports_id` bigint NOT NULL COMMENT '运动会ID',
  `sports_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动会名称',
  `college_id` bigint NULL DEFAULT NULL COMMENT '承办学院',
  `start_time` datetime NULL DEFAULT NULL COMMENT '运动会开始时间',
  `end_time` datetime NULL DEFAULT NULL COMMENT '运动员结束时间',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`sports_id`) USING BTREE,
  INDEX `college_id3`(`college_id` ASC) USING BTREE,
  CONSTRAINT `sports_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `college` (`college_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '运动会表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sso_user
-- ----------------------------
DROP TABLE IF EXISTS `sso_user`;
CREATE TABLE `sso_user`  (
  `user_id` bigint NOT NULL COMMENT '用户id',
  `account` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '账号',
  `password` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '密码',
  `state` int NULL DEFAULT 1 COMMENT '用户状态：1-启用；0-禁用',
  `role_type` int NULL DEFAULT 0 COMMENT '角色类别：0--志愿者；1--运动员；2--裁判；3--学院管理员；4--超级管理员',
  `open_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '第三方登陆openid',
  `login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '登录时IP地址',
  `is_delete` int NULL DEFAULT 0 COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for student_athlete
-- ----------------------------
DROP TABLE IF EXISTS `student_athlete`;
CREATE TABLE `student_athlete`  (
  `athlete_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '运动员ID',
  `athlete_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员姓名',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户id',
  `student_id` bigint NULL DEFAULT NULL COMMENT '学号',
  `athlete_sex` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员性别',
  `athlete_age` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员年龄',
  `athlete_group` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员组别：1-学生；2--教工; 3-全体职工',
  `college_id` bigint NULL DEFAULT NULL COMMENT '学院ID',
  `class_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '班级ID',
  `athlete_state` tinyint NULL DEFAULT NULL COMMENT '状态：1-报名成功;0-报名失败',
  `phone` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '学生运动员电话',
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '学生运动员邮箱',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`athlete_id`) USING BTREE,
  INDEX `student_id1`(`student_id` ASC) USING BTREE,
  INDEX `college_id6`(`college_id` ASC) USING BTREE,
  CONSTRAINT `student_athlete_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `college` (`college_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '学生运动员' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for student_athlete_game
-- ----------------------------
DROP TABLE IF EXISTS `student_athlete_game`;
CREATE TABLE `student_athlete_game`  (
  `athlete_id` bigint NOT NULL COMMENT '学生运动员id',
  `game_id` bigint NULL DEFAULT NULL COMMENT '比赛id',
  `sports_id` bigint NOT NULL COMMENT '运动会ID',
  `score` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员成绩',
  `rank` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员排名',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1.删除 0.保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`athlete_id`, `sports_id`) USING BTREE,
  INDEX `game_id`(`game_id` ASC) USING BTREE,
  CONSTRAINT `student_athlete_game_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '学生运动员参赛表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for teacher_athlete
-- ----------------------------
DROP TABLE IF EXISTS `teacher_athlete`;
CREATE TABLE `teacher_athlete`  (
  `athlete_id` bigint NOT NULL COMMENT '运动员ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户id',
  `athlete_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员名称',
  `teacher_id` bigint NULL DEFAULT NULL COMMENT '教工号',
  `athlete_sex` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员性别',
  `athlete_age` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员年龄',
  `college_id` bigint NULL DEFAULT NULL COMMENT '学院ID',
  `phone` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '教职工运动员电话',
  `athlete_group` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '运动员组别：1-学生；2--教工; 3-全体职工',
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '教职工运动员邮箱',
  `athlete_state` tinyint NULL DEFAULT NULL COMMENT '状态：1-报名成功;0-报名失败',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`athlete_id`) USING BTREE,
  INDEX `teacher_id1`(`teacher_id` ASC) USING BTREE,
  INDEX `college_id9`(`college_id` ASC) USING BTREE,
  CONSTRAINT `teacher_athlete_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `college` (`college_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '教师运动员' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for teacher_athlete_game
-- ----------------------------
DROP TABLE IF EXISTS `teacher_athlete_game`;
CREATE TABLE `teacher_athlete_game`  (
  `athlete_id` bigint NOT NULL COMMENT '教师运动员id',
  `game_id` bigint NULL DEFAULT NULL COMMENT '比赛id',
  `sports_id` bigint NOT NULL COMMENT '运动会ID',
  `score` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '成绩',
  `rank` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '排名',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`athlete_id`, `sports_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '教师运动员参赛表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for volunteer
-- ----------------------------
DROP TABLE IF EXISTS `volunteer`;
CREATE TABLE `volunteer`  (
  `volunteer_id` bigint NOT NULL COMMENT '志愿者ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户id',
  `student_id` bigint NULL DEFAULT NULL COMMENT '学号',
  `volunteer_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '志愿者姓名',
  `phone` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '电话号码',
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `duration` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '志愿时长',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`volunteer_id`) USING BTREE,
  INDEX `student_id2`(`student_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '志愿者表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for volunteer_game
-- ----------------------------
DROP TABLE IF EXISTS `volunteer_game`;
CREATE TABLE `volunteer_game`  (
  `volunteer_id` bigint NOT NULL COMMENT '志愿者id',
  `game_id` bigint NULL DEFAULT NULL COMMENT '比赛id',
  `sports_id` bigint NOT NULL COMMENT '运动会ID',
  `volunteer_work` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '志愿者工作内容或者职责：卡表',
  `is_delete` tinyint NULL DEFAULT NULL COMMENT '1:删除;0:保留',
  `add_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`volunteer_id`, `sports_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '志愿者比赛表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
