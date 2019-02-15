const Pusher = require('pusher');
const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const secret = require('../config/secret'); // Take your app secret code from https://dashboard.pusher.com/

var pusher = new Pusher(secret);

module.exports = app => {
    app.get('/poll', (req, res, next) => {
        Vote.find()
            .then((votes) => {
            res.send({
                success: true,
                votes: votes
            })
        });
    });

    app.post('/poll', (req, res) => {

        const newVote = {
            os: req.body.os,
            points: 1
        }

        new Vote(newVote).save().then((vote) => {
            pusher.trigger('os-poll', 'os-vote', {
                points: parseInt(vote.points),
                os: vote.os
            });
    
            res.send({
                success: true,
                message: 'Thank you for voting'
            })
        })
    });
};