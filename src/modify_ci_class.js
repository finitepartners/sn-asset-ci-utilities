/* globals AssetCIUtils, request, response */
AssetCIUtils.addCIClassToCategory(request.getParameter('model_ref_field'), request.getParameter('ci_class'));
response.sendRedirect('success.do');
