const Comment = require('../models/comment');
const Post = require('../models/post');
const commentsMailer = require('../mailers/comments_mailer');

module.exports.create = async function(req, res) {
    try {
        let post = await Post.findById(req.body.post);

        if(post) {
            let comment = await Comment.create({
                content: req.body.content,
                post: req.body.post,
                user: req.user._id
            });

            post.comments.push(comment);
            post.save();

            comment = await comment.populate('user', 'name email');
            commentsMailer.newComment(comment);

            return res.redirect('/');
        }
    }
    catch(err) {
        console.log('Error: ', err);
        return;
    }
}

module.exports.destroy = async function(req, res) {
    try {
        let comment = await Comment.findById(req.params.id);

        if(comment.user == req.user.id) {
            let postId = comment.post;
            comment.remove();

            await Post.findByIdAndUpdate(postId, { $pull: {comments: req.params.id}});
            
            return res.redirect('back');
        }
        else {
            return res.redirect('back');
        }
    }
    catch(err) {
        console.log('Error: ', err);
        return;
    }
}

/*
// without async await
module.exports.create = function(req, res) {
    Post.findById(req.body.post, function(err, post) {
        if(post) {
            Comment.create({
                content: req.body.content,
                post: req.body.post,
                user: req.user._id
            }, function(err, comment) {
                // handle error

                post.comments.push(comment);
                post.save();

                return res.redirect('/');
            });
        }
    });
}

module.exports.destroy = function(req, res) {
    Comment.findById(req.params.id, function(err, comment) {
        if(comment.user == req.user.id) {
            let postId = comment.post;
            comment.remove();

            Post.findByIdAndUpdate(postId, { $pull: {comments: req.params.id}}, function(err, post) {
                return res.redirect('back');
            })
        }
        else {
            return res.redirect('back');
        }
    })
}
*/