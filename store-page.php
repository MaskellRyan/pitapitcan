<?php
/************************************************************************
* Store Page
*************************************************************************/

get_header(); ?>

<section class="blog alternate-bg2 page-padding" id="blog">
		
<?php while(have_posts()) : the_post(); ?>

	<?php the_content(); ?>

<?php endwhile;?>

</section><!-- ./blog -->

<?php get_footer(); ?>