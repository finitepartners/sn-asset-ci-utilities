/* globals AssetCIUtils, request, response */
AssetCIUtils.createCIsFromAssets(request.getParameter('model_ref_field'));
response.sendRedirect('success.do');
