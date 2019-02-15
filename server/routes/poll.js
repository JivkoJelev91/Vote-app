const Pusher = require('pusher');
const mongoose = require('mongoose');
const Vote = require('../models/Vote');

var pusher = new Pusher({
    appId: '714220',
    key: '7bbbd7b9f04578359a2d',
    secret: '631a0e1bccf7e7ed9830',
    cluster: 'eu',
    encrypted: true
});

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