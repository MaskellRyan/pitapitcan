<!DOCTYPE html>
<!--[if lt IE 7 ]><html class="ie ie6" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 7 ]><html class="ie ie7" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 8 ]><html class="ie ie8" <?php language_attributes(); ?>> <![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--><html <?php language_attributes(); ?>> <!--<![endif]-->
<head>
	<!-- Basic Page Needs
  ================================================== -->
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<title><?php wp_title('&raquo;', true, 'right' );?></title>

	<!-- Mobile Specific Metas
  ================================================== -->

  	<?php global $smof_data; ?>

	<?php if(isset($smof_data['nzs_responsive_layout']) && 0 == $smof_data['nzs_responsive_layout']): ?>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<?php endif; ?>

		<!-- CSS
  ================================================== -->


	<?php

	 	if(!empty($smof_data['nzs_custom_favicon'])):

	 		echo '<link rel="icon" href="'.$smof_data['nzs_custom_favicon'].'">';

	 	endif;
  	?>


	<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

	<?php wp_head(); ?>


	<link rel="stylesheet" type="text/css" href="//devppc.coeur.io/assets/css/social.css">
    <link rel="stylesheet" type="text/css" href="//devppc.coeur.io/assets/css/franchising.css">
		<link rel="stylesheet" type="text/css" href="//devppc.coeur.io/assets/css/ContactUs.css">
		<link rel="stylesheet" type="text/css" href="//devppc.coeur.io/assets/css/ContactUs2.css">


	<script src="//devppc.coeur.io/assets/js/greensock/TweenMax.min.js"></script>
	<script src="//devppc.coeur.io/assets/js/greensock/jquery.gsap.min.js"></script>

		<script type="text/javascript" src="//devppc.coeur.io/assets/js/franchising.js"></script>
		<script type="text/javascript" src="//devppc.coeur.io/assets/js/store-page-contact.js"></script>
    <script type="text/javascript" src="//devppc.coeur.io/assets/js/contact_us.js"></script>
    <script type="text/javascript" src="//devppc.coeur.io/assets/js/current_location.js"></script>
    <script type="text/javascript" src="//devppc.coeur.io/assets/js/languages.js"></script>
		<!-- FAQ's click to show answer script -->
		<script type="text/javascript" src="//devppc.coeur.io/assets/js/NewContactUs.js"></script>

    <?php
    if(LANG_FR){
    ?>
    <style>
	
	/*
	 * FRENCH SPECIFIC CSS
	 **/
	
	
    .has-french-1 .lang-eng-cond{ display: none;}
    .has-french-1 .lang-fr-cond{ display: block !important;}
    /*.has-french-1 span.lang-fr-cond{ display: inline !important;}*/
    
    .has-french-0 .lang-eng-cond, .has-french- .lang-eng-cond{ display: block;}
    /*.has-french-0 span.lang-eng-cond, .has-french- .lang-eng-cond{ display: inline !important;} */
    .has-french-0 .lang-fr-cond, .has-french- .lang-fr-cond{ display: none;}
    
    .eng_find_button{ display: none !important;}
    .fr_find_button{ display: block !important;}
    
    .lang-fr{ display: block;}
    .lang-eng{ display: none;}
	
	
	
	#state_map_div {
        overflow: hidden;
    }

	#addressSubmit.slp_ui_button {
		background-image: url('wp-content/themes/ninezeroseven/images/slp-images/fr/mapFindBtn.jpg') !important;
        position: relative;
        background-size: 100%;
        background-repeat: no-repeat;
	}

#state_map_input_div {
    width: 530px;
}

.state_map_input_div_en{
    width: 400px;
}


#state_map_input_button {
    background-image: url('wp-content/themes/ninezeroseven/images/slp-images/fr/mapFindBTN.png') !important;

}

        #search_table{
            width: 500px !important;
        }
.eng_find_button{
    width: 248px;
}

        @media screen and (min-width: 1200px) {
            .state_map_input_div_en {
                left: 200px;
            }
            #addressSubmit.slp_ui_button {
                width: 200px !important;
                right: -100px !important;
            }
        }

        @media screen and (max-width: 1200px) and (min-width: 767px) {
            nav.mainMenu ul li a {
                font-size: 12px !important;
            }
            #state_map_input_button {
                width: 250px;
            }
            #addressSubmit.slp_ui_button {
                width: 200px !important;
                right: -100px !important;
            }
        }

        @media screen and (max-width: 767px) and (min-width: 480px){
            #search_table{
                width: 400px !important;
            }

            #addressInput{
                width: 150px !important;
            }
            #state_map_input_address {
                font-size: 10px !important;
            }
/*            #state_map_input_div {
                left: 200px;
            }*/

            #addressSubmit.slp_ui_button {
                width: 208px !important;
                right: -29px !important;
            }

                .eng_find_button{
        width: 100px !important;
    }
        .map-banner-img {
        margin: 0 auto -2px;
    }

        }

        @media screen and (max-width: 480px) and (min-width: 240px){
            #search_table{
                width: 400px !important;
            }

            .sl_header #addressSubmit.slp_ui_button {
                width: 132px !important;
            }

            #addressInput{
                width: 110px !important;
            }
            #state_map_input_address {
                font-size: 8px !important;
            }
        }
@media only screen and (max-width: 479px) {

    #state_map_input_button{
        width: 100px !important;
    }
    #state_map_input_div {
        width: 530px;
        left: 33px;
    }

    #state_map_input_button {
    width: 59px !important;
    }

    #searchForm {
        height: 36px;
    }

    #addressSubmit.slp_ui_button {
        width: 130px !important;
        right: 2px !important;
        height: 30px;
    }
    #addy_in_address #addressInput {
        width: 100px !important;
        height: 31px !important;
    }
    .map-banner-img {
        margin: 0 auto 0;
    }

}

@media only screen and (max-width: 959px) and (min-width: 768px) {
.state_map_input_div_en {
    left: 53px;
    top: 240px !important;
}
}
        #state_map_input_address{
            font-size: 20px;
            padding-left: 10px !important;;
        }

	/*
	 * END FRENCH SPECIFIC CSS
	 **/
	
    </style>

        <script type="text/javascript">
            var LANG_FR = true;
        </script>

    <?php } else { ?>

    <style>
        .sl_header #addressSubmit.slp_ui_button {
            background-image: url(//devppc.coeur.io/wp-content/plugins/store-locator-le/images/mapFindBtn2.png) !important;
            width: 200px !important;
            right: -95px;
        }

    .lang-fr-cond{ display: none !important;}
    </style>


        <script type="text/javascript">
            var LANG_FR = false;
        </script>
    <?php } ?>

</head>

<body <?php body_class(); ?>>
<!-- Primary Page Layout
	================================================== -->

<div id="up"></div>

<!-- TOP BAR -->


<!--<section class="topBar--> <?php //echo nzs_menu_class();?> <!--" id="top">-->
	<!--<div class="container" id="headerContainer">-->

		<?php

			if(isset($smof_data['nzs_plain_text_logo']) && 0 == $smof_data['nzs_plain_text_logo']){
				$use_logo = " class=\"hide-text\"";
			}
		 ?>

        <!--<div class="topBarBG"></div>-->
        <div id="scrollingHeader" class="header-bg">
					<?php // HEADER LOGO FRENCH FIX
					if(!LANG_FR) { ?>
						<a href="//devppc.coeur.io/#" class="logoButton">
                <img src="//devppc.coeur.io/wp-content/themes/ninezeroseven/assets/img/pita_logo.png" />
            </a>
					<?php }else{ ?>
						<a href="//devppc.coeur.io/#?lang=fr" class="logoButton">
                <img src="//devppc.coeur.io/wp-content/themes/ninezeroseven/assets/img/pita_logo.png" />
            </a>
			    <?php } ?>


            <select id="langSelect" style="top: 2px; right: 2px; position: absolute;">

            <?php

            //if( array_shift(explode(".",$_SERVER['HTTP_HOST'])) == "fr"){
            if(LANG_FR){
                ?>

                <option value="fr" selected="selected">Français (Français)</option>
                <option value="en">English (Anglais)</option>

                <?php
            }else {

                ?>

                <option value="en" selected="selected">English (English)</option>
                <option value="fr">Français (French)</option>


            <?php

            }
            ?>

            </select>

            <!-- DROP DOWN MENU -->
            <?php echo  ninezeroseven_wp_drop_menu();?>

            <nav class="mainMenu">
                <?php wp_nav_menu( array( 'container' => '','menu_id'=> 'main-menu', 'theme_location' => 'primary','fallback_cb'=> '') );?>
            </nav>

            <div class="header_overlay"></div>
        </div>


<div id="social_buttons_nav" >
	<div class="social_btn">
        <img class="orderOnlineImage" src="//devppc.coeur.io/wp-content/uploads/2013/12/flag-canada.png"/>
    </div>
</div>

<div id="navFooter">

    <?php

    //if( array_shift(explode(".",$_SERVER['HTTP_HOST'])) == "fr"){
    if(!LANG_FR) {
        ?>

        <ul>
            <li><a href="/loyalty/" target="_blank"><img
                        src="//devppc.coeur.io/wp-content/themes/ninezeroseven/assets/img/pit_card_btn.png"/></a>
            </li>
            <li><a href="/build/" target="_blank"><img
                        src="//devppc.coeur.io/wp-content/themes/ninezeroseven/assets/img/build_pita_btn.png"/></a>
            </li>
            <li><a href="//devppc.coeur.io/#franchise"><img
                        src="//devppc.coeur.io/wp-content/uploads/2013/12/franIcon.png"/></a></li>

            <li><a href="/catering/" ><img
                        src="//devppc.coeur.io/wp-content/uploads/2013/12/cateringRev.png"/></a></li>
            <!--<li><a href="http://www.thatsbiz.com/cu/ppcorp/inter/inter.html" target="_blank"><img src="//devppc.coeur.io/wp-content/themes/ninezeroseven/assets/img/join_eclub_btn.png"/></a></li>-->
        </ul>
    <?php }else{ ?>
        <ul>
            <li><a href="/loyalty/" target="_blank"><img src="//devppc.coeur.io/assets/img/fr/pit_card_btn.png"/></a></li>
            <li><a href="/build/" target="_blank"><img src="//devppc.coeur.io/assets/img/fr/build_pita_btn.png"/></a></li>
            <li><a href="http://fr.devnwu.com/pitapitcan/#franchising-2" ><img src="//devppc.coeur.io/assets/img/fr/franIcon.png"/></a></li>

            <li><a href="/traiteur/" ><img src="//devppc.coeur.io/assets/img/fr/cateringRev.png"/></a></li>
            <!--<li><a href="http://www.thatsbiz.com/cu/ppcorp/inter/inter.html" target="_blank"><img src="//devppc.coeur.io/wp-content/themes/ninezeroseven/assets/img/join_eclub_btn.png"/></a></li>-->
        </ul>

    <?php } ?>

</div>

    <!-- ENDS TOP BAR -->

<?php
echo nzs_show_header();
?>
