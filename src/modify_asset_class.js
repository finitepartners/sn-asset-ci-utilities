/* globals AssetCIUtils, request, response */
AssetCIUtils.addAssetClassToCategory(request.getParameter('model_ref_field'), request.getParameter('asset_class'));
response.sendRedirect('success.do');
