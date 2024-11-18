-- Active: 1722313046741@@127.0.0.1@3306@course_management

create database cpdbs;

use cpdbs; 
-- drop table if exists problems;
-- drop table if exists contests;
-- drop table if exists users;
-- drop table if exists submissions;


create table users (
    username varchar(50) primary key,
    email varchar(100),
    rating smallint default null,
    country varchar(100) default null,
    university varchar(100) default null,
    problem_count smallint default 0,
    max_rating smallint default null,
    rating_title varchar(30),
    last_updated DATETIME NULL,
    password VARCHAR(255) NOT NULL
);


create table contests (
    contest_id int primary key,
    contest_name varchar(100),
    start_time datetime,
    end_time datetime,
    duration varchar(20),
    contest_type varchar(20)
);

create table problems (
    problem_id varchar(10) primary key default '800',
    title varchar(100),
    contest_id int,
    diff_rating smallint default 800,
    memory_limit varchar(20) default '256 megabyte',
    time_limit varchar(20) default '1 second',
    foreign key (contest_id) references contests(contest_id)
);

create table submissions(
    submission_id bigint primary key auto_increment,
    problem_id varchar(10),
    username varchar(50),
    verdict varchar(30),
    submission_time datetime,
    execution_time smallint,
    memory_used varchar(20),
    language_used varchar(50),
    foreign key (problem_id) references problems(problem_id),
    foreign key (username) references users(username)
);

create table tags(
    tag_id tinyint primary key auto_increment,
    tag_name varchar(50)
);

create table problem_tags(
    problem_id varchar(10),
    tag_id tinyint,
    foreign key (problem_id) references problems(problem_id),
    foreign key (tag_id) references tags(tag_id)
);

create table user_contests(
    username varchar(50),
    contest_id int,
    contest_rank int,
    rating_change smallint,
    penalty smallint,
    foreign key (username) references users(username),
    foreign key (contest_id) references contests(contest_id)
);

create table contest_authors(
    username varchar(50),
    contest_id int,
    foreign key (username) references users(username),
    foreign key (contest_id) references contests(contest_id)
);

use cpdbs;
ALTER TABLE users
ADD COLUMN password VARCHAR(255) NOT NULL;

